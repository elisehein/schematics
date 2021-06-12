import { getA11yDescription } from "../../figureData.js";
import TimerManager from "../../helpers/TimerManager.js";
import SVGShapeFactory from "../SVGShapes/SVGShapeFactory.js";
import smoothScroll from "/helpers/smoothScroll.js";
import BezierEasing from "/helpers/BezierEasing.js";
import Duration from "../../helpers/Duration.js";

export default class Diagram extends HTMLElement {
  constructor(num, isThumbnail) {
    super();
    this.num = num;
    this.a11yDescription = getA11yDescription(num);
    this._timerManager = new TimerManager();
    this._isThumbnail = isThumbnail;

    this._svgShapeFactory = new SVGShapeFactory(this._isThumbnail);
  }

  connectedCallback() {
    this.style.width = "100%";
    this.style.height = "100%";

    this.innerHTML = `
      <svg
        class="diagram${this._isThumbnail ? " diagram--thumbnail" : ""}"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        viewbox="0 0 300 300"
        aria-labelledby="${this.descID}"
        xmlns="http://www.w3.org/2000/svg">
        <desc id="${this.descID}">
          fig. <span class="diagram__num">${this.num}</span>.
          <span class="diagram__a11y-description">${this.a11yDescription}</span>
        </desc>
      </svg>
    `;

    if (this._isThumbnail) {
      this.drawThumbnail();
    }
  }

  drawBeforeCaption({ onDone }) {
    this.scrollIntoView();
    onDone();
  }

  drawAlongsideCaption() {}

  drawAfterCaption() {}

  onCaptionPause() {}

  drawPreview() {}

  clearAllTimers() {
    this._timerManager.clearAllTimeouts();
    this._timerManager.clearAllIntervals();
  }

  renderTitle() {
    const node = this.querySelector(".diagram__num");
    if (node) {
      node.innerHTML = this.num;
    }
  }

  updateDescID() {
    const svgNode = this.svgNode;
    const descNode = this.querySelector("desc");

    if (svgNode && descNode) {
      svgNode.setAttribute("aria-labelledby", this.descID);
      descNode.setAttribute("id", this.descID);
    }
  }

  renderDescription() {
    const node = this.querySelector(".diagram__a11y-description");
    if (node) {
      node.innerHTML = this.a11yDescription;
    }
  }

  addSVGChildElement(el) {
    this.svgNode.appendChild(el);
  }

  /* Until we have other use cases, keep it simple with the assumption that scrolling
   * main all the way to the left will bring the diagram into view.
   */
  smoothScrollIntoView({ onDone }) {
    const duration = new Duration({ milliseconds: 700 });
    smoothScroll(document.querySelector("main"), 0, 0, duration, BezierEasing.easeOutCubic, { onDone });
  }

  scrollIntoView() {
    document.documentElement.scrollLeft = 0;
    document.documentElement.scrollTop = 0;
  }

  static get observedAttributes()  {
    return ["num", "a11ydescription"];
  }

  attributeChangedCallback(attrName, oldValue, newValue) {
    if (newValue == oldValue) {
      return;
    }

    switch (attrName) {
      case "num":
        this.renderTitle();
        this.updateDescID();
        break;
      case "a11ydescription":
        this.renderDescription();
        break;
      default:
        break;
    }
  }

  get a11yDescription() {
    return this.getAttribute("a11ydescription");
  }

  set a11yDescription(newValue) {
    if (newValue !== this.a11yDescription) {
      this.setAttribute("a11ydescription", newValue);
    }
  }

  get num() {
    return parseInt(this.getAttribute("num"));
  }

  set num(newValue) {
    if (newValue !== this.num) {
      this.setAttribute("num", newValue);
    }
  }

  get descID() {
    return `figure-${this.num}-desc`;
  }

  get svgNode() {
    return this.querySelector("svg");
  }
}
