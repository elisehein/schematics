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

    const onLightUp = this.lightUpFigure.bind(this);

    this._diagramElement.drawBeforeCaption({
      onLightUp,
      onDone: () => {
        this._diagramElement.drawAlongsideCaption();
        this.renderCaption({
          onDone: () => this._diagramElement.drawAfterCaption({ onLightUp })
        });
      }
    });
  }

  cleanUpCurrentFigure(num) {
    this.classList.remove(this.className(num));

    if (this._captionTyping) {
      this._captionTyping.cancelCurrentSession();
    }

    if (this._diagramElement) {
      this._diagramElement.clearAllTimers();
    }

    this.querySelector(".schematics-figure__figure__figcaption").innerHTML = "";
    this.querySelector(".schematics-figure__figure__diagram-container").innerHTML = "";
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
