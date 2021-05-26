import { getPoetry, getDiagram } from "../../figureData.js";

import CaptionTyping from "./CaptionTyping.js";

export default class SchematicsFigure extends HTMLElement {
  constructor(num) {
    super();
    this.num = num || this.getAttribute("num");
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

    this.querySelector(".schematics-figure__figure__figcaption").innerHTML = "";
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

    this.transition(() => this.update());
  }

  transition(onDone) {
    if (this._stopTransitioningTimer) {
      clearTimeout(this._stopTransitioningTimer);
    }

    this.figureNode.classList.add("schematics-figure__figure--transitioning");

    const stopTransitioning = () => {
      this._stopTransitioningTimer = setTimeout(() => {
        this.figureNode.classList.remove("schematics-figure__figure--transitioning");
        this._stopTransitioningTimer = null;
        onDone();
      }, 1000);
    };

    // figure--transitioning may or may not trigger transitions/animations;
    // we don't want to depend on that.
    if (this.figureNode.getAnimations().length > 0) {
      this.figureNode.addEventListener("transitionend", stopTransitioning, { once: true });
    } else {
      stopTransitioning();
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

    const diagramElement = getDiagram(this.num);
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

  showNewFigure(newFigureNum, { forceRestart }) {
    const oldFigureNum = this.num;
    this.num = newFigureNum;

    if (oldFigureNum == newFigureNum && forceRestart) {
      this.transition(() => this.update());
    }

    this.style.display = "block";
  }

  hide(onDone) {
    this.transition(() => {
      this.style.display = "none";
      onDone();
    });
  }
}

customElements.define("schematics-figure", SchematicsFigure);
