import { getA11yDescription } from "../../figureData.js";
import TimerManager from "../../helpers/TimerManager.js";
import SVGShapeFactory from "../SVGShapes/SVGShapeFactory.js";
import smoothScroll from "/helpers/smoothScroll.js";
import BezierEasing from "/helpers/BezierEasing.js";

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
        aria-labelledby="figure-desc"
        xmlns="http://www.w3.org/2000/svg">
        <desc id="figure-desc">
          fig. <span id="figure-num">${this.num}</span>.
          <span id="figure-a11y-description">${this.a11yDescription}</span>
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
    const node = this.querySelector("#figure-num");
    if (node) {
      node.innerHTML = this.num;
    }
  }

  renderDescription() {
    const node = this.querySelector("#figure-a11y-description");
    if (node) {
      node.innerHTML = this.a11yDescription;
    }
  }

  addSVGChildElement(el) {
    this.svgNode.appendChild(el);
  }

  /* Until we have other use cases, keep it simple with the assumption that scrolling
   * body all the way to the left will bring the diagram into view.
   */
  smoothScrollIntoView({ onDone }) {
    smoothScroll(document.documentElement, 0, 0, 700, BezierEasing.easeOutCubic, { onDone });
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

  get svgNode() {
    return this.querySelector("svg");
  }
}
