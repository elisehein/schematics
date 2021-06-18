import { HTMLDiagram } from "./Diagram.js";
import { randomIntBetween } from "/helpers/random.js";
import Duration from "/helpers/Duration.js";

export default class Figure43Diagram extends HTMLDiagram {
  constructor(...args) {
    super(43, ...args);
  }

  drawBeforeCaption({ onDone }) {
    this.divContainerNode.innerHTML = cubeMarkup;
    this.makeFuzzyAtRandomIntervals();

    this._timerManager.setTimeout(onDone, 1000);
  }

  drawThumbnail() {
    this.divContainerNode.innerHTML = cubeMarkup;
  }

  makeFuzzyAtRandomIntervals() {
    const randomDelay = new Duration({ seconds: randomIntBetween(0, 5) });
    const randomDuration = new Duration({ milliseconds: randomIntBetween(1500, 4000) });

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
