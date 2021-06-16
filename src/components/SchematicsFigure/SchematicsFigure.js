import { getPoetry, getDiagram } from "../../figureData.js";
import transitionWithClasses from "/helpers/transitionWithClasses.js";

import CaptionTyping from "./CaptionTyping.js";

export default class SchematicsFigure extends HTMLElement {
  constructor(num) {
    super();
    this.num = num || this.getAttribute("num");
  }

  connectedCallback() {
    this.classList.add("schematics-figure");
    this.innerHTML = document.getElementById("schematics-figure-template").innerHTML;
    this.renderFigure();
  }

  renderFigure() {
    this._diagramElement = this.renderDiagram();

    if (!this._diagramElement) {
      return;
    }

    this._captionTyping = new CaptionTyping(getPoetry(this.num));
    this.renderA11yCaption();

    const onLightUp = this.lightUpFigure.bind(this);
    const onFuzzy = this.makeFigureFuzzy.bind(this);
    const onJitter = this.jitterDiagram.bind(this);
    const onDeleteCaption = this.deleteCaption.bind(this);
    const onRetypeCaption = this.renderCaption.bind(this);
    const drawAfterCaption = () => this._diagramElement.drawAfterCaption({
      onLightUp,
      onJitter,
      onDeleteCaption,
      onRetypeCaption
    });

    this._diagramElement.drawBeforeCaption({ onLightUp, onJitter, onFuzzy, onDone: () => {
      this._diagramElement.drawAlongsideCaption();
      this.renderCaption({ onDone: drawAfterCaption });
    } });
  }

  cleanUpCurrentFigure(num) {
    this.classList.remove(this.className(num));

    if (this._captionTyping) {
      this._captionTyping.cancelCurrentSession();
    }

    if (this._diagramElement) {
      this._diagramElement.clearAllTimers();
    }

    clearTimeout(this._lightUpTimer);
    clearTimeout(this._fuzzyTimer);
    this.figureNode.classList.remove("schematics-figure__figure--light-up");
    this.figureNode.classList.remove("schematics-figure__figure--fuzzy");

    this.animatedFigcaptionNode.innerHTML = "";
    this.visuallyHiddenFigcaptionNode.innerHTML = "";
    this.diagramContainerNode.innerHTML = "";
  }

  lightUpFigure(duration) {
    if (this._lightUpTimer) {
      clearTimeout(this._lightUpTimer);
    }

    this.style.setProperty("--schematics-figure-light-up-duration", `${duration.s}s`);
    this.figureNode.classList.add("schematics-figure__figure--light-up");

    this._lightUpTimer = setTimeout(() => {
      this.figureNode.classList.remove("schematics-figure__figure--light-up");
      this._lightUpTimer = null;
    }, duration.ms);
  }

  makeFigureFuzzy(duration, { onDone } = {}) {
    if (this._fuzzyTimer) {
      clearTimeout(this._fuzzyTimer);
    }

    this.style.setProperty("--schematics-figure-fuzzy-duration", `${duration.s}s`);
    this.figureNode.classList.add("schematics-figure__figure--fuzzy");

    this._fuzzyTimer = setTimeout(() => {
      this.figureNode.classList.remove("schematics-figure__figure--fuzzy");
      this._fuzzyTimer = null;
      onDone && onDone();
    }, duration.ms);
  }

  jitterDiagram(duration, { onDone } = {}) {
    this.style.setProperty("--schematics-figure-jitter-duration", `${duration.s}s`);
    transitionWithClasses(this.diagramContainerNode, ["schematics-figure__figure__diagram-container--jitter"], onDone);
  }

  static get observedAttributes()  {
    return ["num"];
  }

  attributeChangedCallback(attrName, oldNum, newNum) {
    if (newNum == oldNum) {
      return;
    }

    if (newNum) {
      this.switchFigure(oldNum);
    } else {
      this.cleanUpCurrentFigure(oldNum);
    }
  }

  switchFigure(oldNum) {
    if (this._transitionTimer) {
      clearTimeout(this._transitionTimer);
    }

    const showNewFigure = () => {
      this._transitionTimer = setTimeout(() => {
        this.classList.add(this.className(this.num));
        this.renderFigure();
        transitionWithClasses(this.figureNode, ["schematics-figure__figure--showing"], () => {
          this._transitionTimer = null;
        });
      }, 1000);
    };

    if (oldNum) {
      transitionWithClasses(this.figureNode, ["schematics-figure__figure--hiding"], () => {
        this.cleanUpCurrentFigure(oldNum);
        showNewFigure();
      });
    } else {
      showNewFigure();
    }
  }

  renderDiagram() {
    if (!Number.isInteger(this.num)) {
      return null;
    }

    const diagramElement = getDiagram(this.num);
    this.diagramContainerNode.replaceChildren(diagramElement);
    return diagramElement;
  }

  renderCaption({ onDone }) {
    if (!Number.isInteger(this.num)) {
      return;
    }

    const onPause = (index, duration) => this._diagramElement.onCaptionPause(index, duration);
    this._captionTyping.animate(this.animatedFigcaptionNode, onPause, onDone);
  }

  deleteCaption({ onDone }) {
    if (!Number.isInteger(this.num)) {
      return;
    }

    this._captionTyping.animateDelete(this.animatedFigcaptionNode, onDone);
  }

  renderA11yCaption() {
    // We never want to force screen reader users to wait until the diagram has animated before they
    // can hear the caption.
    this.visuallyHiddenFigcaptionNode.innerText = this._captionTyping.fullCaption;
  }

  className(num) {
    return `schematics-figure--${num}`;
  }

  get figureNode() {
    return this.querySelector(".schematics-figure__figure");
  }

  get animatedFigcaptionNode() {
    return this.querySelector(".schematics-figure__figure__figcaption__animated");
  }

  get visuallyHiddenFigcaptionNode() {
    return this.querySelector(".schematics-figure__figure__figcaption__visually-hidden");
  }

  get diagramContainerNode() {
    return this.querySelector(".schematics-figure__figure__diagram-container");
  }

  get num() {
    const raw = this.getAttribute("num");
    return raw ? parseInt(raw) : null;
  }

  set num(newValue) {
    if (newValue !== this.num) {
      this.setAttribute("num", newValue);
    }
  }

  switchNum(newNum) {
    this.num = newNum;
  }

  showWithNum(newNum) {
    this.style.display = "block";
    this.switchNum(newNum);
  }

  hide(onDone = () => {}) {
    transitionWithClasses(this.figureNode, ["schematics-figure__figure--hiding"], () => {
      this.style.display = "none";
      onDone();
    });
  }
}

customElements.define("schematics-figure", SchematicsFigure);
