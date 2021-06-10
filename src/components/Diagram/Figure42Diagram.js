import { animatable } from "/components/SVGShapes/SVGShapeFeatures.js";
import { runActionsSequentially, waitBeforeNextAction } from "/helpers/sequentialActionRunning.js";
import BezierEasing from "/helpers/BezierEasing.js";
import Diagram from "./Diagram.js";

const commonAnimationProps = dur => ({
  fill: "freeze",
  begin: "indefinite",
  dur,
  keyTimes: "0; 1",
  calcMode: "spline",
  keySplines: BezierEasing.easeInOutCubic.smilString
});

export default class Figure42Diagram extends Diagram {
  constructor(isThumbnail) {
    super(42, isThumbnail);

    this._stars = [];
  }

  drawBeforeCaption({ onDone }) {
    this.drawStars();

    runActionsSequentially([
      waitBeforeNextAction(1000, this._timerManager),
      this.animateTemperatureOnXAxis.bind(this, 5),
      this.animateMagnitudeOnYAxis.bind(this, 5),
      waitBeforeNextAction(1000, this._timerManager)
    ], onDone);
  }

  drawThumbnail() {
  }

  // eslint-disable-next-line max-statements
  drawStars() {
    this.drawStarsAlongYAxis(15, 29, 50, 63, 67);
    this.drawStarsAlongYAxis(28, 70);
    this.drawStarsAlongYAxis(42, 63, 67);
    this.drawStarsAlongYAxis(53, 53);
    this.drawStarsAlongYAxis(56, 60, 74, 78);
    this.drawStarsAlongYAxis(66, 57, 74, 78, 90, 94, 105, 133, 222);
    this.drawStarsAlongYAxis(70, 74);
    this.drawStarsAlongYAxis(73, 98, 102, 108);
    this.drawStarsAlongYAxis(77, 105);
    this.drawStarsAlongYAxis(84, 98, 112, 136);
    this.drawStarsAlongYAxis(122, 77, 88, 108, 112);
    this.drawStarsAlongYAxis(132, 132, 143, 153);
    this.drawStarsAlongYAxis(149, 98, 112, 116, 122, 126, 132, 136, 140, 143, 149, 153);
    this.drawStarsAlongYAxis(155, 64);
    this.drawStarsAlongYAxis(162, 77, 81, 88, 112, 116, 119, 136, 143, 146, 150, 157, 163);
    this.drawStarsAlongYAxis(173, 132, 163, 167);
    this.drawStarsAlongYAxis(176, 115, 122, 125, 129, 132, 136, 143, 146, 150, 153, 156, 163, 167, 170, 184, 191, 194);
    this.drawStarsAlongYAxis(180, 129, 150, 167);
    this.drawStarsAlongYAxis(204, 115, 119, 132, 139, 143, 149, 153, 157, 160, 167, 170, 174, 180, 187);
    this.drawStarsAlongYAxis(231, 63, 77, 81, 101, 108, 115, 139, 146, 153, 157, 160, 164, 167, 170, 174, 177, 181, 184, 191, 215, 219);
    this.drawStarsAlongYAxis(235, 77, 153, 157, 164, 170, 177, 181);
    this.drawStarsAlongYAxis(242, 191, 197, 201, 229, 239);
    this.drawStarsAlongYAxis(259, 77, 87, 98, 153, 160, 163, 167, 171, 173, 188, 195, 202, 205, 218, 229, 242, 256);
    this.drawStarsAlongYAxis(269, 56);
    this.drawStarsAlongYAxis(286, 46, 53, 191, 194, 205, 211, 215, 218, 222, 263);
  }

  drawStarsAlongYAxis(x, ...yCoords) {
    this._stars = this._stars.concat(yCoords.map(y => this.drawStar(x, y)));
  }

  drawStar(x, y) {
    const width = 2;
    const height = 3;

    const circle = this._svgShapeFactory.getCircle(x, y, width, height);
    circle.fill();

    // Keep track of the intended coordinates as we will override them with random ones
    circle.node.dataset.x = x;
    circle.node.dataset.y = y;

    this.scatterRandomly(circle.node, x, y);
    this.addSVGChildElement(circle.node);

    return circle;
  }

  scatterRandomly(node, x, y) {
    const viewBox = this.querySelector("svg").viewBox.baseVal;
    node.setAttribute("fill-opacity", x / viewBox.width);

    node.dataset.appliedScale = y / (viewBox.height / 2);
    node.setAttribute("transform-origin", `${x} ${y}`);
    node.setAttribute("transform", `scale(${node.dataset.appliedScale})`);

    const randomXTranslation = this.getRandomTranslationWithinBounds(x, viewBox.width, 7);
    const randomYTranslation = this.getRandomTranslationWithinBounds(y, viewBox.height, 10);
    node.setAttribute("cx", x + randomXTranslation);
    node.setAttribute("cy", y + randomYTranslation);
  }

  getRandomTranslationWithinBounds(originalValue, bounds, inset) {
    const randomPositiveTranslation = randomIntBetween(0, bounds - originalValue - inset);
    const randomNegativeTranslation = randomIntBetween(0, originalValue - inset) * -1;
    return Math.random() > 0.5 ? randomPositiveTranslation : randomNegativeTranslation;
  }

  animateTemperatureOnXAxis(durationSec, { onDone }) {
    this._stars.forEach((star, index) => {
      const animatableStar = animatable(star);
      const opacityAnimationID = this.opacityAnimationID(index);
      const translationAnimationID = this.xTranslationAnimationID(index);

      animatableStar.animateAttribute("fill-opacity", Object.assign({
        id: opacityAnimationID,
        from: star.node.getAttribute("fill-opacity"),
        to: 1,
      }, commonAnimationProps(durationSec)));

      animatableStar.animateAttribute("cx", Object.assign({
        id: translationAnimationID,
        values: `${star.node.getAttribute("cx")};${star.node.dataset.x}`,
      }, commonAnimationProps(durationSec)));

      animatableStar.beginAnimation(opacityAnimationID);
      animatableStar.beginAnimation(translationAnimationID, () => {
        if (index == 0) {
          onDone();
        }
      });
    });
  }

  animateMagnitudeOnYAxis(durationSec, { onDone }) {
    this._stars.forEach((star, index) => {
      const animatableStar = animatable(star);
      const scaleAnimationID = this.scaleAnimationID(index);
      const translationAnimationID = this.yTranslationAnimationID(index);

      animatableStar.animateTransform("scale", Object.assign({
        id: scaleAnimationID,
        from: star.node.dataset.appliedScale,
        to: "1"
      }, commonAnimationProps(durationSec)));

      animatableStar.animateAttribute("cy", Object.assign({
        id: translationAnimationID,
        values: `${star.node.getAttribute("cy")};${star.node.dataset.y}`,
      }, commonAnimationProps(durationSec)));

      animatableStar.beginAnimation(scaleAnimationID);
      animatableStar.beginAnimation(translationAnimationID, () => {
        if (index == 0) {
          onDone();
        }
      });
    });
  }

  xTranslationAnimationID(index) {
    return `x-translation-animation-${index}`;
  }

  opacityAnimationID(index) {
    return `opacity-animation-${index}`;
  }

  yTranslationAnimationID(index) {
    return `y-translation-animation-${index}`;
  }

  scaleAnimationID(index) {
    return `scale-animation-${index}`;
  }
}

const randomIntBetween = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

customElements.define("figure-40-diagram", Figure42Diagram);
