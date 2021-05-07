import { getPoetry, getDiagramElement } from "./diagrams/FigureFactory.js";

export default class SchematicsFigure extends HTMLElement {
  constructor(num) {
    super();
    this.num = num;
  }

  connectedCallback() {
    this.innerHTML = document.getElementById("single-figure-template").innerHTML;
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
    this.figureNode.classList.add("figure--exiting");

    const stopExitingAndUpdate = () => {
      this.figureNode.classList.remove("figure--exiting");
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
      this.figureNode.classList.replace(this.className(oldNum), this.className(this.num));
    } else {
      this.figureNode.classList.add(this.className(this.num));
    }

    this.renderDiagram();
    this.renderCaption();
  }

  renderDiagram() {
    if (!Number.isInteger(this.num)) {
      return;
    }

    const diagramElement = getDiagramElement(this.num);
    this.querySelector(".diagram-container").replaceChildren(diagramElement);
    setTimeout(diagramElement.animate.bind(diagramElement), 2000);
  }

  renderCaption() {
    if (!Number.isInteger(this.num)) {
      return;
    }

    this.querySelector("figcaption").innerText = getPoetry(this.num);
  }

  className(num) {
    return `figure${num}`;
  }

  get figureNode() {
    return this.querySelector("figure");
  }

  get num() {
    return parseInt(this.getAttribute("num"));
  }

  set num(newValue) {
    if (newValue !== this.num) {
      this.setAttribute("num", newValue);
    }
  }
}

customElements.define("schematics-figure", SchematicsFigure);