import { createSVGElement } from "./SVGShapes/SVGShapes.js";

const patternHeightEm = "0.17";

/*
 * We cannot use a shared pattern def for all scanlines because we need to
 * modify the colour. While we do use currentcolor, it seems that will
 * evaluate to the color in the context of where the def appears in the
 * markup. If we had a single shared def at the end of <body>, the colour
 * would always evaluate to the body colour, not to the colour of
 * <scan-lines>'s position in the markup.
 *
 * But each def also needs to have a unique id, which is why we keep track of
 * instances here.
 */
let instanceID = 0;

export default class ScanLines extends HTMLElement {
  constructor() {
    super();
    this.uniqueID = instanceID;
    instanceID += 1;
  }

  connectedCallback() {
    this.setAttribute("role", "presentation");
    this.replaceChildren(this.renderSVGPattern());
  }

  renderSVGPattern() {
    const svg = createSVGElement("svg");
    svg.setAttribute("role", "presentation");

    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.style.display = "block";

    const patternID = `scan-lines-pattern-${this.uniqueID}`;
    const gradientID = `${patternID}__gradient`;

    svg.innerHTML = `
    <defs>
      <linearGradient id="${gradientID}" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="currentcolor" stop-opacity="0"/>
        <stop offset="40%" stop-color="currentcolor" stop-opacity="0.4"/>
        <stop offset="50%" stop-color="currentcolor" stop-opacity="0.6"/>
        <stop offset="60%" stop-color="currentcolor" stop-opacity="0.4"/>
        <stop offset="100%" stop-color="currentcolor" stop-opacity="0"/>
      </linearGradient>

      <pattern id="${patternID}" x="0" y="0" width="1" height="${patternHeightEm}em" patternUnits="userSpaceOnUse">
        <rect x="0" y="0" width="1" height="${patternHeightEm}em" fill="url(#${gradientID}"></rect>
      </pattern>
    </defs>
    <rect x="0" y="0" width="100%" height="100%" fill="url(#${patternID})"></rect>
    `;

    return svg;
  }
}

customElements.define("scan-lines", ScanLines);
