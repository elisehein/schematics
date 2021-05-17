const captionAnimationFlagActions = {
  PAUSE: "PAUSE",
  TYPE: "TYPE"
}

export default class CaptionTyping {
  constructor(unparsedCaption) {
    const { parsedAndWrappedCaption, animationDirectives } = this.parse(unparsedCaption);

    this.parsedAndWrappedCaption = parsedAndWrappedCaption;
    this.animationDirectives = animationDirectives;

    this.typingDelays = [];

    // eslint-disable-next-line no-useless-escape
    this.flagRegex = /\[[^\[]*\]/g;
  }

  parse(unparsedCaption) {
    let match;
    let captionWithoutFlags = unparsedCaption;
    const animationDirectives = [];

    // eslint-disable-next-line no-cond-assign
    while (match = this.flagRegex.exec(captionWithoutFlags)) {
      const { captionWithoutMatchedFlag, directives } = constructDirectives(captionWithoutFlags, match);
      directives.forEach(directive => animationDirectives.push(directive));
      captionWithoutFlags = captionWithoutMatchedFlag;
    }

    const parsedAndWrappedCaption = captionWithoutFlags
      .replace(/[^\n]/g, "<span style=\"visibility: hidden\">$&</span>")
      .replace(/\n/g, "<br/>");

    return { parsedAndWrappedCaption, animationDirectives };
  }

  constructDirectives(caption, match) {
    const flag = match[0];
    const { action, setting } = this.actionAndSettingFromFlag(flag);
    const captionWithoutMatchedFlag =
      caption.slice(0, match.index) + caption.slice(match.index + flag.length);

    const range = this.constructRangeForDirective(match.index, action, captionWithoutMatchedFlag);
    const directives = [ new CaptionAnimationDirective(action, setting, range) ];

    const continuingDirectiveAfterPauseIfNeeded = this.constructContinuingDirective(action);
    if (continuingDirectiveAfterPauseIfNeeded) {
      directives.push(continuingDirectiveAfterPauseIfNeeded);
    }

    return { captionWithoutMatchedFlag, directives };
  }

  constructRangeForDirective(fromIndex, action, captionWithoutMatchedFlag) {
    if (action == captionAnimationFlagActions.PAUSE) {
      return { fromIndex, toIndex: fromIndex };
    }

    const nextMatch = this.flagRegex.exec(captionWithoutMatchedFlag);

    if (!nextMatch) {
      return { fromIndex, toIndex: captionWithoutMatchedFlag.length - 1 };
    }

    return { fromIndex, toIndex: nextMatch.index - 1 };
  }

  constructContinuingDirective(previousDirectiveAction, captionWithoutPreviousFlag) {
    if (previousDirectiveAction != captionAnimationFlagActions.PAUSE) {
      return null;
    }


  }

  animate(captionNode, onDone) {
    captionNode.innerHTML = this.parsedAndWrappedCaption;
    const captionSpans = captionNode.querySelectorAll("span");
    this.handleDirective(0, this.animationDirectives, captionSpans, onDone);
  }

  handleDirective(directiveIndex, allDirectives, captionSpans, onDone) {
    const directive = allDirectives[directiveIndex];

    if (!directive) {
      onDone();
      return;
    }

    directive.execute(captionSpans, () => {
      this.handleDirective(directiveIndex + 1, allDirectives, captionSpans, onDone);
    });
  }

  actionAndSettingFromFlag(flagString) {
    const [_, action, setting] = flagString.match(/^\[(.*):(.*)\]$/);
    return { action, setting };
  };
}

const captionAnimationTypingSpeeds = {
  SLOWEST: 600,
  SLOW: 400,
  NORMAL: 300,
  FAST: 200,
  FASTEST: 100
};

const captionAnimationPauseDurations = {
  SHORT: 500,
  MEDIUM: 1000,
  LONG: 1500
}

class CaptionAnimationDirective {
  constructor(action, setting, { fromIndex, toIndex }) {
    this._action = captionAnimationFlagActions[action];
    this._range = { fromIndex, toIndex };

    if (this._action == captionAnimationFlagActions.PAUSE) {
      this._pauseDuration = captionAnimationPauseDurations[setting];
    } else if (this._action == captionAnimationFlagActions.TYPE) {
      this._spanRevealDelay = captionAnimationTypingSpeeds[setting];
    }
  }

  execute(captionSpans, onDone) {
    if (this._action == captionAnimationFlagActions.PAUSE) {
      this.animateTyping(captionSpans, onDone);
    } else if (this._action == captionAnimationFlagActions.TYPE) {
      setTimeout(() => { onDone() }, this._pauseDuration);
    }
  }

  animateTyping(captionSpans, onDone) {
    this.revealSpans({ fromIndex: this.fromIndex, toIndex: this.toIndex, captionSpans, onDone });
  }

  revealSpans({ fromIndex, toIndex, captionSpans, onDone }) {
    setTimeout(() => {
      captionSpans[fromIndex].style.visibility = "visible";

      if (fromIndex < toIndex) {
        this.revealSpans({ fromIndex: fromIndex + 1, toIndex, captionSpans, onDone });
      } else {
        onDone();
      }
    }, this._spanRevealDelay);
  }
}
