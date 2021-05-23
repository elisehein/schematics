const captionAnimationFlagActions = {
  PAUSE: "PAUSE",
  TYPE: "TYPE"
}

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
}

export default class CaptionTyping {
  constructor(unparsedCaption) {
    this.defaultDelay = 0;
    // eslint-disable-next-line no-useless-escape
    this.flagRegex = /\[[^\[]*\]/g;

    const { parsedAndWrappedCaption, singleCharacterDelayRanges } = this.parse(unparsedCaption);

    this.parsedAndWrappedCaption = parsedAndWrappedCaption;
    this.singleCharacterDelayRanges = singleCharacterDelayRanges;
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

    const extractedRanges = [newRange]
    let updatedDelay = latestActiveDelay;
    let updatedPausesSoFar = pausesSoFar;

    // After a pause, the delay needs to be reset to the currently active typing delay
    if (action == captionAnimationFlagActions.PAUSE) {
      updatedPausesSoFar += 1;
      extractedRanges[0].isPause = true;
      extractedRanges[0].pauseIndex = updatedPausesSoFar - 1;
      extractedRanges.push({ index: flagIndex + 1, delay: latestActiveDelay })
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
    const wrap = str => `<span class="schematics-figure__figure__figcaption__character">${str}</span>`;
    return caption
      .replace(/[^\n]/g, wrap("$&"))
      .replace(/\n/g, wrap("<br/>"));
  }

  animate(captionNode, onPause, onDone) {
    captionNode.innerHTML = this.parsedAndWrappedCaption;
    const captionSpans = captionNode.querySelectorAll("span");
    this.revealSpan({ index: 0, captionSpans, onPause, onDone });
  }

  revealSpan({ index, captionSpans, onPause, onDone }) {
    if (index >= captionSpans.length) {
      onDone();
      return;
    }

    const revealThisSpanAndNext = () => {
      this.updateVisibility(index, captionSpans);
      this.revealSpan({ index: index + 1, captionSpans, onPause, onDone });
    }

    const { delay, isPause, pauseIndex } = this.getActiveDelayInfoAtSpan(index);

    if (isPause) {
      onPause(pauseIndex, delay);
    }

    if (delay == 0) {
      revealThisSpanAndNext();
    } else {
      setTimeout(() => revealThisSpanAndNext(), delay);
    }
  }

  updateVisibility(index, captionSpans) {
    if (index > 0) {
      captionSpans[index - 1].classList.remove(
        "schematics-figure__figure__figcaption__character--latest-visible",
        );
    }
    captionSpans[index].classList.add(
      "schematics-figure__figure__figcaption__character--visible",
      "schematics-figure__figure__figcaption__character--latest-visible",
      );
  }

  getActiveDelayInfoAtSpan(index) {
    const rangeApplyingAtIndex = this.singleCharacterDelayRanges
      .filter(range => range.index <= index)
      .pop();
    const rangeAtIndex = this.singleCharacterDelayRanges.find(range => range.index == index);
    return {
      delay: rangeApplyingAtIndex.delay,
      isPause: rangeAtIndex && rangeAtIndex.isPause,
      pauseIndex: rangeAtIndex && rangeAtIndex.pauseIndex
    }
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
    }

    return { action, delay };
  };
}
