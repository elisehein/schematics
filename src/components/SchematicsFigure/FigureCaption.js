import { getPoetry } from "../../figureData.js";
import CaptionTyping from "./CaptionTyping.js";

export default class FigureCaption extends HTMLElement {
  constructor(num) {
    super();
    this.num = num;
    this._captionTyping = new CaptionTyping(getPoetry(this.num));
  }

  connectedCallback() {
    // We never want to force screen reader users to wait until the diagram has animated before they
    // can hear the caption.
    this.innerHTML = `
    <p class="${this.animatedPClassName}" aria-hidden="true" aria-live="off"></p>
    <p class="${this.hiddenPClassName} sr-only">${this._captionTyping.fullCaption}</p>
    `;
  }

  cleanUp() {
    this._captionTyping.cancelCurrentSession();
    this.animatedFigcaptionNode.innerHTML = "";
    this.visuallyHiddenFigcaptionNode.innerHTML = "";
  }

  animateCaption({ onDone }) {
    this._captionTyping.animate(this.animatedFigcaptionNode, onDone);
  }

  runAdditionalAnimationsAfterCaption({ onDone }) {
    onDone();
  }

  deleteCaption({ onDone }) {
    this._captionTyping.animateDelete(this.animatedFigcaptionNode, onDone);
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
