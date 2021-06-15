import { getA11yDescription, getA11yThumbnailDescription } from "../../figureData.js";
import TimerManager from "../../helpers/TimerManager.js";
import SVGShapeFactory from "../SVGShapes/SVGShapeFactory.js";
import smoothScroll from "/helpers/smoothScroll.js";
import BezierEasing from "/helpers/BezierEasing.js";
import Duration from "../../helpers/Duration.js";

class Diagram extends HTMLElement {
  constructor(num, isThumbnail) {
    super();
    this.num = num;
    this.a11yDescription = isThumbnail ? getA11yThumbnailDescription(num) : getA11yDescription(num);

    this._isThumbnail = isThumbnail;
    this._timerManager = new TimerManager();
  }

  connectedCallback() {
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

  drawThumbnail() {}

  onCaptionPause() {}

  clearAllTimers() {
    this._timerManager.clearAllTimeouts();
    this._timerManager.clearAllIntervals();
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

  get a11yLabel() {
    return `Figure ${this.num}: ${this.a11yDescription}`;
  }

  get containerClassname() {
    return `diagram${this._isThumbnail ? " diagram--thumbnail" : ""}`;
  }
}

export class SVGDiagram extends Diagram {
  constructor(num, isThumbnail) {
    super(num, isThumbnail);
    this._svgShapeFactory = new SVGShapeFactory(isThumbnail);
  }

  connectedCallback() {
    this.innerHTML = `
    <svg
      class="${this.containerClassname}"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      viewbox="0 0 300 300"
      aria-labelledby="${this.descID}"
      xmlns="http://www.w3.org/2000/svg">
      <desc id="${this.descID}">${this.a11yLabel}</desc>
    </svg>
    `;

    this.style.width = "100%";
    this.style.height = "100%";

    super.connectedCallback();
  }

  get svgNode() {
    return this.querySelector("svg");
  }

  get descID() {
    return `figure-${this.num}-${this._isThumbnail ? "thumbnail-" : ""}desc`;
  }

  addSVGChildElement(el) {
    if (this.svgNode) {
      this.svgNode.appendChild(el);
    }
  }
}

export class HTMLDiagram extends Diagram {
  connectedCallback() {
    this.innerHTML = `
    <div class="${this.containerClassname}" role="img" aria-label="${this.a11yLabel}"></div>
    `;

    super.connectedCallback();
  }

  get divContainerNode() {
    return this.querySelector("div.diagram");
  }
}
