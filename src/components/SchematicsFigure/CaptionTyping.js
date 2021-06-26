const captionAnimationFlagActions = {
  PAUSE: "PAUSE",
  TYPE: "TYPE"
};

const captionAnimationTypingSpeeds = {
  SLOWEST: 200,
  SLOW: 130,
  NORMAL: 70,
  FAST: 45,
  FASTEST: 20
};

const captionAnimationPauseDurations = {
  SHORT: 300,
  MEDIUM: 800,
  LONG: 1300
};

export default class CaptionTyping {
  constructor(unparsedCaption, timerManager) {
    this.defaultDelay = 0;
    // eslint-disable-next-line no-useless-escape
    this.flagRegex = /\[[^\[]*\]/g;

    const { parsedAndWrappedCaption, singleCharacterDelayRanges } = this.parse(unparsedCaption);

    this._unparsedCaption = unparsedCaption;
    this.parsedAndWrappedCaption = parsedAndWrappedCaption;
    this.singleCharacterDelayRanges = singleCharacterDelayRanges;

    this._timerManager = timerManager;
  }

  parse(unparsedCaption) {
    let activeDelay = this.defaultDelay;
    let pausesSoFar = 0;

    let parsedCaptionSoFar = unparsedCaption;
    const delayRanges = [{ index: 0, delay: activeDelay }];

    const allFlags = unparsedCaption.match(this.flagRegex) || [];
    allFlags.forEach(flag => {
      const { flagIndex, updatedCaption } = this.discardFlag(flag, parsedCaptionSoFar);
      parsedCaptionSoFar = updatedCaption;

      const {
        updatedDelay,
        updatedPausesSoFar,
        extractedRanges
      } = this.extractDelayRangesFromFlag(flag, flagIndex, activeDelay, pausesSoFar);
      activeDelay = updatedDelay;
      pausesSoFar = updatedPausesSoFar;
      extractedRanges.forEach(delayRange => this.appendRange(delayRange, delayRanges));
    });

    return {
      parsedAndWrappedCaption: this.wrapIndividualCharacters(parsedCaptionSoFar),
      singleCharacterDelayRanges: delayRanges
    };
  }

  discardFlag(flag, caption) {
    const flagIndex = caption.indexOf(flag);
    return { flagIndex, updatedCaption: caption.replace(flag, "") };
  }

  extractDelayRangesFromFlag(flag, flagIndex, latestActiveDelay, pausesSoFar) {
    const { action, delay: delayForCurrentFlag } = this.actionAndDelayFromFlag(flag);
    const newRange = { index: flagIndex, delay: delayForCurrentFlag };

    const extractedRanges = [newRange];
    let updatedDelay = latestActiveDelay;
    let updatedPausesSoFar = pausesSoFar;

    // After a pause, the delay needs to be reset to the currently active typing delay
    if (action == captionAnimationFlagActions.PAUSE) {
      updatedPausesSoFar += 1;
      extractedRanges[0].isPause = true;
      extractedRanges[0].pauseIndex = updatedPausesSoFar - 1;
      extractedRanges.push({ index: flagIndex + 1, delay: latestActiveDelay });
    } else {
      updatedDelay = delayForCurrentFlag;
    }

    return { updatedDelay, updatedPausesSoFar, extractedRanges };
  }

  appendRange(newRange, existingRanges) {
    const latestDelayRange = existingRanges[existingRanges.length - 1];

    if (!latestDelayRange) {
      existingRanges.push(newRange);
      return;
    }

    if (latestDelayRange.index == newRange.index) {
      existingRanges[existingRanges.length - 1] = newRange;
      return;
    }

    existingRanges.push(newRange);
  }

  wrapIndividualCharacters(caption) {
    const baseClass = "schematics-figure__figure__figcaption__character";

    const span = (spanClasses, innerText) => (
      `<span class="${spanClasses.join(" ")}">${innerText}</span>`
    );

    const wrap = str => {
      const classes = [baseClass];

      if (str == "<br/>") {
        classes.push(`${baseClass}--line-break`);
        return `${span(classes, "")}<br/>`;
      }

      return span(classes, str);
    };

    return caption
      .replace(/[^\n]/g, wrap("$&"))
      .replace(/\n/g, wrap("<br/>"));
  }

  animate(captionNode, onDone) {
    this._timerManager.clearTimeout(this._timer);
    captionNode.innerHTML = this.parsedAndWrappedCaption;
    const captionChars = captionNode.querySelectorAll("span");
    this.revealChar({ index: 0, captionChars, onDone });
  }

  animateDelete(captionNode, onDone) {
    this._timerManager.clearTimeout(this._timer);

    const captionChars = captionNode.querySelectorAll("span");
    this.hideChar({ index: captionChars.length - 1, captionChars, onDone });
  }

  revealChar({ index, captionChars, onDone }) {
    if (index >= captionChars.length) {
      onDone();
      return;
    }

    const revealThisSpanAndNext = () => {
      this.makeCharVisible(index, captionChars);
      this.revealChar({ index: index + 1, captionChars, onDone });
    };

    const delay = this.getActiveDelayAtSpan(index);

    if (delay == 0) {
      revealThisSpanAndNext();
    } else {
      this._timer = this._timerManager
        .setTimeout(() => revealThisSpanAndNext(), delay);
    }
  }

  hideChar({ index, captionChars, onDone }) {
    if (index < 0) {
      onDone();
      return;
    }

    const hideThisSpanAndPrevious = () => {
      this.makeCharInvisible(index, captionChars);
      this.hideChar({ index: index - 1, captionChars, onDone });
    };

    this._timer = this._timerManager
      .setTimeout(() => hideThisSpanAndPrevious(), 100);
  }

  makeCharVisible(index, captionChars) {
    captionChars[index].scrollIntoView({ block: "nearest", behavior: "smooth" });

    if (index > 0) {
      captionChars[index - 1].classList.remove(
        "schematics-figure__figure__figcaption__character--latest-visible"
        );
    }
    captionChars[index].classList.add(
      "schematics-figure__figure__figcaption__character--visible",
      "schematics-figure__figure__figcaption__character--latest-visible"
      );
  }

  makeCharInvisible(index, captionChars) {
    captionChars[index].classList.remove(
      "schematics-figure__figure__figcaption__character--visible",
      "schematics-figure__figure__figcaption__character--latest-visible"
      );

    if (index > 0) {
      captionChars[index - 1].scrollIntoView({ block: "nearest", behavior: "smooth" });
      captionChars[index - 1].classList.add(
        "schematics-figure__figure__figcaption__character--latest-visible"
        );
    }
  }

  getActiveDelayAtSpan(index) {
    const rangeApplyingAtIndex = this.singleCharacterDelayRanges
      .filter(range => range.index <= index)
      .pop();
    return rangeApplyingAtIndex.delay;
  }

  actionAndDelayFromFlag(flagString) {
    const [_, action, setting] = flagString.match(/^\[(.*):(.*)\]$/);
    let delay;

    switch (action) {
      case captionAnimationFlagActions.PAUSE:
        // If no pause duration keyword is found in the dict, assume it's a raw duration in ms
        delay = captionAnimationPauseDurations[setting] || parseInt(setting);
        break;
      case captionAnimationFlagActions.TYPE:
        delay = captionAnimationTypingSpeeds[setting];
        break;
      default:
    }

    return { action, delay };
  }

  get fullCaption() {
    return this._unparsedCaption.replace(/\[[^\[]*\]/g, "");
  }
}
