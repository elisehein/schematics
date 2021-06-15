import { HTMLDiagram } from "./Diagram.js";

export default class Figure43Diagram extends HTMLDiagram {
  constructor(isThumbnail) {
    super(43, isThumbnail);
  }

  drawBeforeCaption({ onDone }) {
    this.divContainerNode.innerHTML = cubeMarkup;
    onDone();
  }

  drawThumbnail() {
    this.divContainerNode.innerHTML = cubeMarkup;
  }
}

customElements.define("figure-43-diagram", Figure43Diagram);

const cubeMarkup = `
<div class="cube">
  <div class="cube__face cube__face--front"></div>
  <div class="cube__face cube__face--back"></div>
  <div class="cube__face cube__face--right"></div>
  <div class="cube__face cube__face--left"></div>
  <div class="cube__face cube__face--top"></div>
  <div class="cube__face cube__face--bottom"></div>
</div>
`;