import Figure14Diagram from "../Diagram/Figure14Diagram.js";
import Figure18Diagram from "../Diagram/Figure18Diagram/Figure18Diagram.js";
import Figure36Diagram from "../Diagram/Figure36Diagram/Figure36Diagram.js";
import Figure43Diagram from "../Diagram/Figure43Diagram.js";

import { getPoetry } from "../../figureData.js";

import CaptionTyping from "./CaptionTyping.js";

export default class SchematicsFigure extends HTMLElement {
  constructor(num) {
    super();
    this.num = num;
  }

  connectedCallback() {
    this.innerHTML = document.getElementById("schematics-figure-template").innerHTML;
    this.renderFigure();
  }

  renderFigure() {
    this.cleanUpCurrentFigure();
    this._diagramElement = this.renderDiagram();

    if (!this._diagramElement) {
      return;
    }

    this.querySelector(".schematics-figure__figure__figcaption").innerHTML = "";

    this._diagramElement.drawBeforeCaption({ onDone: () => {
      this._diagramElement.drawAlongsideCaption();
      this.renderCaption({ onDone: () => {
        this._diagramElement.drawAfterCaption({ onLightUp: this.lightUpFigure.bind(this) });
      } });
    } });
  }

  cleanUpCurrentFigure() {
    if (this._captionTyping) {
      this._captionTyping.cancelCurrentSession();
    }

    if (this._diagramElement) {
      this._diagramElement.clearAllTimers();
    }
  }

  lightUpFigure(durationMS) {
    this.style.setProperty("--schematics-figure-light-up-duration", `${durationMS}ms`);
    this.figureNode.classList.add("schematics-figure__figure--light-up");

    setTimeout(() => {
      this.figureNode.classList.remove("schematics-figure__figure--light-up");
    }, durationMS);
  }

  static get observedAttributes()  {
    return ["num"];
  }

  attributeChangedCallback(attrName, oldNum, newNum) {
    if (newNum == oldNum) {
      return;
    }

    this.updateWithTransition();
  }

  updateWithTransition() {
    if (this._stopTransitioningTimer) {
      clearTimeout(this._stopTransitioningTimer);
    }

    this.figureNode.classList.add("schematics-figure__figure--transitioning");

    const stopTransitioningAndUpdate = () => {
      this._stopTransitioningTimer = setTimeout(() => {
        this.figureNode.classList.remove("schematics-figure__figure--transitioning");
        this.update();
        this._stopTransitioningTimer = null;
      }, 1000);
    };

    // figure--transitioning may or may not trigger transitions/animations;
    // we don't want to depend on that.
    if (this.figureNode.getAnimations().length > 0) {
      this.figureNode.addEventListener("transitionend", stopTransitioningAndUpdate, { once: true });
    } else {
      stopTransitioningAndUpdate();
    }
  }

  update() {
    // Note this will only work so far that we only ever add one class to schematics-figure
    this.setAttribute("class", this.className(this.num));
    this.renderFigure();
  }

  renderDiagram() {
    if (!Number.isInteger(this.num)) {
      return null;
    }

    const diagramElement = this.getDiagram(this.num);
    this.querySelector(".schematics-figure__figure__diagram-container").replaceChildren(diagramElement);
    return diagramElement;
  }

  renderCaption({ onDone }) {
    if (!Number.isInteger(this.num)) {
      return;
    }

    const onPause = (index, duration) => this._diagramElement.onCaptionPause(index, duration);

    const captionNode = this.querySelector(".schematics-figure__figure__figcaption");
    this._captionTyping = new CaptionTyping(getPoetry(this.num));
    this._captionTyping.animate(captionNode, onPause, onDone);
  }

  className(num) {
    return `schematics-figure--${num}`;
  }

  get figureNode() {
    return this.querySelector(".schematics-figure__figure");
  }

  get num() {
    return parseInt(this.getAttribute("num"));
  }

  set num(newValue) {
    if (newValue !== this.num) {
      this.setAttribute("num", newValue);
    }
  }

  getDiagram(num) {
    let el;

    switch (num) {
      case 14:
        el = new Figure14Diagram();
        break;
      case 18:
        el = new Figure18Diagram();
        break;
      case 36:
        el = new Figure36Diagram();
        break;
      case 43:
        el = new Figure43Diagram();
        break;
      default:
        throw new Error(`No diagram element specified for figure ${num}.`);
    }

    return el;
  }
}

customElements.define("schematics-figure", SchematicsFigure);
