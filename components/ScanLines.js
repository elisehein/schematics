import { createSVGElement } from "./SVGShapes/SVGShapes.js";

const patternHeightEm = "0.17";

export default class ScanLines extends HTMLElement {
  connectedCallback() {
    this.setAttribute("role", "presentation");
    this.appendChild(this.renderSVGPattern());
  }

  renderSVGPattern() {
    const svg = createSVGElement("svg");
    svg.setAttribute("role", "presentation");

    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");

    const id = "scan-lines-pattern";

    svg.innerHTML = `
    <defs>
      ${renderScanLinePatternDef(id, "currentcolor")}
    </defs>
    <rect x="0" y="0" width="100%" height="100%" fill="url(#${id})"></rect>
    `;

    return svg;
  }
}

customElements.define("scan-lines", ScanLines);

export function renderScanLinePatternDef(id, color) {
  const gradientID = `${id}__gradient`;
  const patternID = `${id}`;

  return `
  <linearGradient id="${gradientID}" x1="0" x2="0" y1="0" y2="1">
    <stop offset="0%" stop-color="${color}" stop-opacity="0"/>
    <stop offset="40%" stop-color="${color}" stop-opacity="0.4"/>
    <stop offset="50%" stop-color="${color}" stop-opacity="0.5"/>
    <stop offset="60%" stop-color="${color}" stop-opacity="0.4"/>
    <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
  </linearGradient>

  <pattern id="${patternID}" x="0" y="0" width="1" height="${patternHeightEm}em" patternUnits="userSpaceOnUse">
    <rect x="0" y="0" width="1" height="${patternHeightEm}em" fill="url(#${gradientID}"></rect>
  </pattern>
  `;
}
