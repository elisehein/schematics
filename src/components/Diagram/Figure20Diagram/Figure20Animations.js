import animateWithEasing from "/helpers/animateWithEasing.js";
import BezierEasing from "/helpers/BezierEasing.js";

export default class Figure20RowAnimations {
  constructor(timerManager, applyTranslationsToRowBars) {
    this._applyTranslationsToRowBars = applyTranslationsToRowBars;
    this._inProgressAnimationTracker = new InProgressAnimationsTracker(timerManager);
  }

  /* Animate all bars from the initial translation directly to the final translation,
   * without any special steps in between.
   * This has the effect of one (set of) peak(s) disappearing and another appearing */
  animateBetweenTranslations(
    targetRow, initialTranslations, finalTranslations, options, onDone = () => {}
  ) {
    this.animateBarTranslations(targetRow, (fractionOfAnimationDone, barIndex) => {
      const diff = finalTranslations[barIndex] - initialTranslations[barIndex];
      return initialTranslations[barIndex] + (diff * fractionOfAnimationDone);
    }, options, onDone);
  }

  /* Animate all bars to go through each set of bar translations in the given list
   * sequentially.
   * If each set of translations provided has the same waveform shape, the waves will
   * look like they're travelling. But they can also look like waves forming or dissolving
   * while travelling, depending on the set of translations given. */
  animateAcrossTranslations(targetRow, translations, options, onDone = () => {}) {
    const numberOfTranslations = translations.length;

    this.animateBarTranslations(targetRow, (fractionOfAnimationDone, barIndex) => {
      const index = Math.floor((numberOfTranslations - 1) * fractionOfAnimationDone);
      return translations[index][barIndex];
    }, options, onDone);
  }

  animateBarTranslations(targetRow, barTranslationGetter, options, onDone = () => {}) {
    const { duration, easing = BezierEasing.linear } = options;
    if (this._inProgressAnimationTracker.isTargetAnimating(targetRow)) {
      onDone();
      return;
    }

    const canceler = animateWithEasing(duration, easing, fractionOfAnimationDone => {
      if (fractionOfAnimationDone > 1 || fractionOfAnimationDone < 0) {
        return;
      }

      this._applyTranslationsToRowBars(
        targetRow, barTranslationGetter.bind(null, fractionOfAnimationDone)
      );
    }, { onDone: () => {
      // We make sure to finish the animation by getting all bars to the intended
      // positions. This is necessary for very short durations where we don't call
      // requestAnimationFrame enough times to make sure the final position is registered.
      this._applyTranslationsToRowBars(
        targetRow, barTranslationGetter.bind(null, 1)
      );
      this._inProgressAnimationTracker.unsetTargetAnimating(targetRow);
      onDone(targetRow);
    } });

    this._inProgressAnimationTracker.setTargetAnimating(targetRow, canceler);
  }

  anyAnimationsInProgress() {
    return this._inProgressAnimationTracker.anyTargetsAnimating();
  }

  cancelAllAnimations() {
    return this._inProgressAnimationTracker.cancelAllAnimations();
  }

  waitForAnimationsToFinish(timeout, onDone) {
    this._inProgressAnimationTracker.waitForAnimationsToFinish(timeout, onDone);
  }
}

class InProgressAnimationsTracker {
  constructor(timerManager) {
    this._animationCancelersByTarget = {};
    this._timerManager = timerManager;
  }

  isTargetAnimating(id) {
    return Object.keys(this._animationCancelersByTarget).indexOf(`${id}`) > -1;
  }

  setTargetAnimating(id, canceler) {
    this._animationCancelersByTarget[id] = canceler;
  }

  unsetTargetAnimating(id) {
    delete this._animationCancelersByTarget[id];
  }

  anyTargetsAnimating() {
    return Object.keys(this._animationCancelersByTarget).length > 0;
  }

  cancelAllAnimations() {
    const fractionOfAnimationDoneByTarget = {};
    Object.keys(this._animationCancelersByTarget).forEach(id => {
      const fractionOfAnimationDone = this._animationCancelersByTarget[id]();
      this.unsetTargetAnimating(id);
      fractionOfAnimationDoneByTarget[id] = fractionOfAnimationDone;
    });
    return fractionOfAnimationDoneByTarget;
  }

  waitForAnimationsToFinish(timeout, onDone) {
    this._timeoutTimer = this._timerManager.setTimeout(() => {
      this._timerManager.clearTimeout(this._timeoutTimer);
      onDone();
    }, timeout.ms);

    this._animationsInProgressChecker = this._timerManager.setInterval(() => {
      if (!this.anyTargetsAnimating()) {
        this._timerManager.clearInterval(this._animationsInProgressChecker);
        this._timerManager.clearTimeout(this._timeoutTimer);
        onDone();
      }
    }, 100);
  }
}
