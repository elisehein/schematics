import { createSVGElement } from "./SVGShapes/SVGShapes.js";

export default class ScanLines extends HTMLElement {
  connectedCallback() {
    this.setAttribute("role", "presentation");
    this.appendChild(this.renderSVGPattern());
  }

  renderSVGPattern() {
    const svg = createSVGElement("svg");
    svg.setAttribute("role", "presentation");

    const patternHeightEm = "0.17";

    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");

    const gradientID = "scan-lines__gradient";
    const patternID = "scan-lines__pattern";

    svg.innerHTML = `
    <defs>
      <linearGradient id="${gradientID}" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="currentcolor" stop-opacity="0"/>
        <stop offset="40%" stop-color="currentcolor" stop-opacity="0.4"/>
        <stop offset="50%" stop-color="currentcolor" stop-opacity="0.5"/>
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
