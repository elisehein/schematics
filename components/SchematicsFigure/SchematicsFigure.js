import Figure14Diagram from "../Diagram/Figure14Diagram.js";
import Figure18Diagram from "../Diagram/Figure18Diagram/Figure18Diagram.js";
import Figure36Diagram from "../Diagram/Figure36Diagram.js";
import Figure43Diagram from "../Diagram/Figure43Diagram.js";

import { getPoetry } from "../../figureData.js";

export default class SchematicsFigure extends HTMLElement {
  constructor(num) {
    super();
    this.num = num;
  }

  connectedCallback() {
    this.innerHTML = document.getElementById("schematics-figure-template").innerHTML;
    this.renderDiagram();
    this.renderCaption();
  }

  static get observedAttributes()  {
    return ["num"];
  }

  attributeChangedCallback(attrName, oldNum, newNum) {
    if (newNum == oldNum) {
      return;
    }

    const maybeIntOldNum = parseInt(oldNum);

    if (maybeIntOldNum) {
      this.updateWithTransition(maybeIntOldNum);
    } else {
      this.update();
    }
  }

  updateWithTransition(oldNum) {
    this.figureNode.classList.add("schematics-figure__figure--exiting");

    const stopExitingAndUpdate = () => {
      this.figureNode.classList.remove("schematics-figure__figure--exiting");
      this.update(oldNum);
    }

    // figure--exiting may or may not trigger transitions/animations;
    // we don't want to depend on that.
    if (this.figureNode.getAnimations().length > 0) {
      this.figureNode.addEventListener("transitionend", stopExitingAndUpdate);
    } else {
      stopExitingAndUpdate();
    }
  }

  update(oldNum) {
    if (Number.isInteger(oldNum)) {
      this.classList.replace(this.className(oldNum), this.className(this.num));
    } else {
      this.classList.add(this.className(this.num));
    }

    this.renderDiagram();
    this.renderCaption();
  }

  renderDiagram() {
    if (!Number.isInteger(this.num)) {
      return;
    }

    const diagramElement = this.getDiagram(this.num);
    this.querySelector(".schematics-figure__figure__diagram-container").replaceChildren(diagramElement);
    setTimeout(diagramElement.animate.bind(diagramElement), 2000);
  }

  renderCaption() {
    if (!Number.isInteger(this.num)) {
      return;
    }

    this.querySelector(".schematics-figure__figure__figcaption").innerText = getPoetry(this.num);
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
        break
      case 36:
        el = new Figure36Diagram();
        break
      case 43:
        el = new Figure43Diagram();
        break
      default:
        throw new Error(`No diagram element specified for figure ${num}.`);
    }

    return el;
  }
}

customElements.define("schematics-figure", SchematicsFigure);