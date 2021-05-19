import { getA11yDescription } from "../../figureData.js";

export default class Diagram extends HTMLElement {
  constructor(num) {
    super();
    this.num = num;
    this.a11yDescription = getA11yDescription(num);
  }

  connectedCallback() {
    this.style.width = "100%";
    this.style.height = "100%";

    this.innerHTML = `
      <svg
        class="diagram"
        preserveAspectRatio="xMidYMin meet"
        role="img"
        viewbox="0 0 300 300"
        aria-labelledby="figure-desc"
        xmlns="http://www.w3.org/2000/svg">
        <desc id="figure-desc">
          fig. <span id="figure-num">${this.num}</span>.
          <span id="figure-a11y-description">${this.a11yDescription}</span>
        </desc>
        <defs></defs>
      </svg>
    `;
  }

  drawBeforeCaption({ onDone }) {
    onDone();
  }

  drawAlongsideCaption() {}
  drawAfterCaption() {}

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

  registerMarker(markerNode) {
    this.querySelector("defs").appendChild(markerNode);
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
    return this.getAttribute("num");
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
