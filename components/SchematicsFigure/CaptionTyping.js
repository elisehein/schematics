const captionAnimationFlagActions = {
  PAUSE: "PAUSE",
  TYPE: "TYPE"
}

const captionAnimationTypingSpeeds = {
  SLOWEST: 130,
  SLOW: 110,
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

    let parsedCaptionSoFar = unparsedCaption;
    const delayRanges = [{ index: 0, delay: activeDelay }];

    const allFlags = unparsedCaption.match(this.flagRegex) || [];
    allFlags.forEach(flag => {
      const { flagIndex, updatedCaption } = this.discardFlag(flag, parsedCaptionSoFar);
      parsedCaptionSoFar = updatedCaption;

      const { updatedDelay, extractedRanges } = this.extractDelayRangesFromFlag(flag, flagIndex, activeDelay);
      activeDelay = updatedDelay;
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

  extractDelayRangesFromFlag(flag, flagIndex, latestActiveDelay) {
    const { action, delay: delayForCurrentFlag } = this.actionAndDelayFromFlag(flag);
    const extractedRanges = [{ index: flagIndex, delay: delayForCurrentFlag }];
    let updatedDelay = latestActiveDelay;

    // After a pause, the delay needs to be reset to the currently active typing delay
    if (action == captionAnimationFlagActions.PAUSE) {
      extractedRanges.push({ index: flagIndex + 1, delay: latestActiveDelay })
    } else {
      updatedDelay = delayForCurrentFlag;
    }

    return { updatedDelay, extractedRanges };
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
    return caption
      .replace(/[^\n]/g, `<span style="visibility: hidden;">$&</span>`)
      .replace(/\n/g, `<span style="visibility: hidden;"><br/></span>`);
  }

  animate(captionNode, onDone) {
    captionNode.innerHTML = this.parsedAndWrappedCaption;
    const captionSpans = captionNode.querySelectorAll("span");
    const firstDelayChange = this.singleCharacterDelayRanges[0];
    const initialDelay = firstDelayChange.index == 0 ? firstDelayChange.delay : this.defaultDelay;
    this.revealSpans({ index: 0, captionSpans, delay: initialDelay, onDone });
  }

  revealSpans({ index, captionSpans, delay, onDone }) {
    if (index >= captionSpans.length) {
      onDone();
      return;
    }

    const revealThisSpanAndNextIfNeeded = () => {
      captionSpans[index].style.visibility = "visible";
      const nextIndex = index + 1;
      const nextDelayChange = this.singleCharacterDelayRanges.find(delayChange => delayChange.index == nextIndex);
      const nextDelay = nextDelayChange ? nextDelayChange.delay : delay;
      this.revealSpans({ index: nextIndex, captionSpans, delay: nextDelay, onDone });
    }

    if (delay == 0) {
      revealThisSpanAndNextIfNeeded();
    } else {
      setTimeout(revealThisSpanAndNextIfNeeded, delay);
    }
  }

  actionAndDelayFromFlag(flagString) {
    const [_, action, setting] = flagString.match(/^\[(.*):(.*)\]$/);
    let delay;

    switch (action) {
      case captionAnimationFlagActions.PAUSE:
        delay = captionAnimationPauseDurations[setting];
        break;
      case captionAnimationFlagActions.TYPE:
        delay = captionAnimationTypingSpeeds[setting];
        break;
    }

    return { action, delay };
  };
}
