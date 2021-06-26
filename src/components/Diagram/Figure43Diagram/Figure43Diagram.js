import { HTMLDiagram } from "../Diagram.js";

import { registerDurationConvenienceInits } from "/helpers/Duration.js";
registerDurationConvenienceInits();

export default class Figure43Diagram extends HTMLDiagram {
  constructor(...args) {
    super(43, ...args);
  }

  async importDependencies() {
    const random = await import("/helpers/random.js");
    this._randomIntBetween = random.randomIntBetween;
  }

  async drawBeforeCaption({ onDone }) {
    super.drawBeforeCaption();
    this.divContainerNode.innerHTML = cubeMarkup;
    await this.importDependencies();
    this.makeFuzzyAtRandomIntervals();
    this._timerManager.setTimeout(onDone, 1000);
  }

  drawThumbnail() {
    this.divContainerNode.innerHTML = cubeMarkup;
  }

  makeFuzzyAtRandomIntervals() {
    const randomDelay = this._randomIntBetween(0, 5).seconds();
    const randomDuration = this._randomIntBetween(1500, 4000).milliseconds();

    this._timerManager.setTimeout(() => {
      this._figureBehavior.onFuzzy(randomDuration, { onDone: () => {
        this.makeFuzzyAtRandomIntervals();
      } });
    }, randomDelay.ms);
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
