import { getPoetry } from "../../figureData.js";
import CaptionTyping from "./CaptionTyping.js";

import transitionWithClasses from "/helpers/transitionWithClasses.js";
import TimerManager from "/helpers/TimerManager.js";

export default class FigureCaption extends HTMLElement {
  constructor(num) {
    super();
    this.num = num;
    this._timerManager = new TimerManager();
    this._captionTyping = new CaptionTyping(getPoetry(this.num), this._timerManager);
  }

  connectedCallback() {
    this.classList.add(`schematics-figure__figure__figcaption--${this.num}`);

    // We never want to force screen reader users to wait until the diagram has animated before they
    // can hear the caption.
    this.innerHTML = `
    <p class="${this.animatedPClassName}" aria-hidden="true" aria-live="off"></p>
    <p class="${this.hiddenPClassName} sr-only">${this._captionTyping.fullCaption}</p>
    `;
  }

  cleanUp() {
    this._timerManager.clearAllTimeouts();
    this._timerManager.clearAllIntervals();
    this.animatedFigcaptionNode.innerHTML = "";
    this.visuallyHiddenFigcaptionNode.innerHTML = "";
  }

  animateCaption({ onDone }) {
    this._captionTyping.animate(this.animatedFigcaptionNode, () => {
      this.runAdditionalAnimations({ onDone });
    });
  }

  // Until we're only dealing with a few special cases,
  // no point in creating subclasses for each figure caption.
  runAdditionalAnimations({ onDone }) {
    switch (this.num) {
      case 20:
        this.addFig20Classes(onDone);
        break;
      default:
        onDone();
    }
  }

  deleteCaption({ onDone }) {
    this._captionTyping.animateDelete(this.animatedFigcaptionNode, onDone);
  }

  addFig20Classes(onDone) {
    const disappear = () => {
      // Leave only "fairytale music"
      const disappearingChars = this.animatedFigcaptionNode
        .querySelectorAll("span:not(:nth-child(n + 48):nth-child(-n + 63))");

      transitionWithClasses(this.animatedFigcaptionNode, [
        "schematics-figure__figure__figcaption--disappearing"
      ], () => {
        disappearingChars.forEach(span => {
          span.style.visibility = "hidden";
        });

        onDone();
      });
    };

    this._timerManager.setTimeout(disappear, 2500);
  }

  get animatedFigcaptionNode() {
    return this.querySelector(`.${this.animatedPClassName}`);
  }

  get visuallyHiddenFigcaptionNode() {
    return this.querySelector(`.${this.hiddenPClassName}`);
  }

  get animatedPClassName() {
    return "schematics-figure__figure__figcaption__animated";
  }

  get hiddenPClassName() {
    return "schematics-figure__figure__figcaption__visually-hidden";
  }
}

customElements.define("figure-caption", FigureCaption);
