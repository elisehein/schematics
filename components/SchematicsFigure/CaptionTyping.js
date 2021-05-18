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

    const { parsedAndWrappedCaption, typingDelayChanges } = this.parse(unparsedCaption);

    this.parsedAndWrappedCaption = parsedAndWrappedCaption;
    this.typingDelayChanges = typingDelayChanges;
  }

  parse(unparsedCaption) {
    // eslint-disable-next-line no-useless-escape
    this.flagRegex = /\[[^\[]*\]/g;
    let latestTypingDelay = this.defaultDelay;

    let captionWithoutFlagsSoFar = unparsedCaption;
    const typingDelayChanges = [{ index: 0, delay: latestTypingDelay }];

    const matchesInUnparsedCaption = unparsedCaption.match(this.flagRegex);

    (matchesInUnparsedCaption || []).forEach(matchedFlag => {
      const flagIndex = captionWithoutFlagsSoFar.indexOf(matchedFlag);
      captionWithoutFlagsSoFar = captionWithoutFlagsSoFar.replace(matchedFlag, "");

      const { action, setting } = this.actionAndSettingFromFlag(matchedFlag);
      if (action == captionAnimationFlagActions.PAUSE) {
        typingDelayChanges.push({ index: flagIndex, delay: captionAnimationPauseDurations[setting] });
        // TODO: Only push if next index exists
        if (captionWithoutFlagsSoFar[flagIndex] != "[") {
          typingDelayChanges.push({ index: flagIndex + 1, delay: latestTypingDelay });
        }
      } else {
        latestTypingDelay = captionAnimationTypingSpeeds[setting];
        const delayChange = { index: flagIndex, delay: latestTypingDelay };
        const length = typingDelayChanges.length;
        if (typingDelayChanges[length - 1] && typingDelayChanges[length - 1].index == flagIndex) {
          typingDelayChanges[length - 1] = delayChange
        } else {
          typingDelayChanges.push(delayChange);
        }
      }
    });

    const parsedAndWrappedCaption = captionWithoutFlagsSoFar
      .replace(/[^\n]/g, `<span style="visibility: hidden;">$&</span>`)
      .replace(/\n/g, `<span style="visibility: hidden;"><br/></span>`);
    return { parsedAndWrappedCaption, typingDelayChanges };
  }

  animate(captionNode, onDone) {
    captionNode.innerHTML = this.parsedAndWrappedCaption;
    const captionSpans = captionNode.querySelectorAll("span");
    const firstDelayChange = this.typingDelayChanges[0];
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
      const nextDelayChange = this.typingDelayChanges.find(delayChange => delayChange.index == nextIndex);
      const nextDelay = nextDelayChange ? nextDelayChange.delay : delay;
      this.revealSpans({ index: nextIndex, captionSpans, delay: nextDelay, onDone });
    }

    if (delay == 0) {
      revealThisSpanAndNextIfNeeded();
    } else {
      setTimeout(revealThisSpanAndNextIfNeeded, delay);
    }
  }

  actionAndSettingFromFlag(flagString) {
    const [_, action, setting] = flagString.match(/^\[(.*):(.*)\]$/);
    return { action, setting };
  };
}
