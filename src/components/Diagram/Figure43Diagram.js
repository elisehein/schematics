import { HTMLDiagram } from "./Diagram.js";
import { randomIntBetween } from "/helpers/random.js";
import transitionWithClasses from "/helpers/transitionWithClasses.js";
import Duration from "/helpers/Duration.js";

export default class Figure43Diagram extends HTMLDiagram {
  constructor(isThumbnail) {
    super(43, isThumbnail);
  }

  drawBeforeCaption({ onDone }) {
    this.divContainerNode.innerHTML = cubeMarkup;
    this.makeFuzzyAtRandomIntervals();
    onDone();
  }

  drawThumbnail() {
    this.divContainerNode.innerHTML = cubeMarkup;
  }

  makeFuzzyAtRandomIntervals() {
    const randomDelay = new Duration({ seconds: randomIntBetween(3, 7) });
    const randomDuration = new Duration({ milliseconds: randomIntBetween(300, 1500) });
    const randomFuzzAmount = randomIntBetween(2, 8) / 10;
    this._timerManager.setTimeout(() => {
      this.style.setProperty("--fuzzy-amount", `${randomFuzzAmount}rem`);
      this.style.setProperty("--fuzzy-duration", `${randomDuration.s}s`);
      transitionWithClasses(this, ["figure-43-diagram--fuzzy"], () => {
        this.makeFuzzyAtRandomIntervals();
      });
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