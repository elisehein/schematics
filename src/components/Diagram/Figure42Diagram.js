import { animatable } from "/components/SVGShapes/SVGShapeFeatures.js";
import { runActionsSequentially, waitBeforeNextAction } from "/helpers/sequentialActionRunning.js";
import BezierEasing from "/helpers/BezierEasing.js";
import { randomIntBetween } from "/helpers/random.js";
import Diagram from "./Diagram.js";

const commonAnimationProps = dur => ({
  fill: "freeze",
  begin: "indefinite",
  dur,
  keyTimes: "0; 1",
  calcMode: "spline",
  keySplines: BezierEasing.easeInOutCubic.smilString
});

const starCoords = [
    { x: 15, allY: [29, 50, 63, 67] },
    { x: 28, allY: [70] },
    { x: 42, allY: [63, 67] },
    { x: 53, allY: [53] },
    { x: 56, allY: [60, 74, 78] },
    { x: 66, allY: [57, 74, 78, 90, 94, 105, 133, 222] },
    { x: 70, allY: [74] },
    { x: 73, allY: [98, 102, 108] },
    { x: 77, allY: [105] },
    { x: 84, allY: [98, 112, 136] },
    { x: 122, allY: [77, 88, 108, 112] },
    { x: 132, allY: [132, 143, 153] },
    { x: 149, allY: [98, 112, 116, 122, 126, 132, 136, 140, 143, 149, 153] },
    { x: 155, allY: [64] },
    { x: 162, allY: [77, 81, 88, 112, 116, 119, 136, 143, 146, 150, 157, 163] },
    { x: 173, allY: [132, 163, 167] },
    { x: 176, allY: [115, 122, 125, 129, 132, 136, 143, 146, 150, 153, 156, 163, 167, 170, 184, 191, 194] },
    { x: 180, allY: [129, 150, 167] },
    { x: 204, allY: [115, 119, 132, 139, 143, 149, 153, 157, 160, 167, 170, 174, 180, 187] },
    { x: 231, allY: [63, 77, 81, 101, 108, 115, 139, 146, 153, 157, 160, 164, 167, 170, 174, 177, 181, 184, 191, 215, 219] },
    { x: 235, allY: [77, 153, 157, 164, 170, 177, 181] },
    { x: 242, allY: [191, 197, 201, 229, 239] },
    { x: 259, allY: [77, 87, 98, 153, 160, 163, 167, 171, 173, 188, 195, 202, 205, 218, 229, 242, 256] },
    { x: 269, allY: [56] },
    { x: 286, allY: [46, 53, 191, 194, 205, 211, 215, 218, 222, 263] }
];

const previewStarCoords = [
  { x: 80, allY: [167] },
  { x: 155, allY: [128, 150] },
  { x: 213, allY: [70] },
  { x: 233, allY: [107, 183, 205] }
];

export default class Figure42Diagram extends Diagram {
  constructor(isThumbnail) {
    super(42, isThumbnail);

    this._stars = [];
  }

  drawBeforeCaption({ onDone, onLightUp }) {
    this.drawStars();

    runActionsSequentially([
      waitBeforeNextAction(1000, this._timerManager),
      this.animateTemperatureOnXAxis.bind(this, 5, onLightUp),
      this.animateMagnitudeOnYAxis.bind(this, 5, onLightUp),
      waitBeforeNextAction(2000, this._timerManager)
    ], onDone);
  }

  drawThumbnail() {
    previewStarCoords.forEach(({ x, allY }) => allY.forEach(y => {
      this._stars.push(this.drawStar(x, y));
    }));
    this._stars.forEach(star => {
      star.node.style.transformOrigin = "center";
      star.node.style.transformBox = "fill-box";
      star.node.style.transform = "scale(6)";
      star.node.style.opacity = "0.9";
    });
  }

  // eslint-disable-next-line max-statements
  drawStars() {
    starCoords.forEach(({ x, allY }) => {
      this.drawStarsAlongYAxis(x, ...allY);
    });
  }

  drawStarsAlongYAxis(x, ...yCoords) {
    this._stars = this._stars.concat(yCoords.map(y => this.drawStar(x, y)));
    this._stars.forEach(star => {
      this.scatterRandomly(
        star.node,
        parseFloat(star.node.dataset.x),
        parseFloat(star.node.dataset.y),
        parseFloat(star.node.dataset.rx),
        parseFloat(star.node.dataset.ry)
      );
    });
  }

  drawStar(x, y) {
    const width = 1.5;
    const height = 2;

    const circle = this._svgShapeFactory.getEllipse(x, y, width, height);
    circle.fill();

    // Keep track of the intended coordinates as we will override them with random ones
    circle.node.dataset.x = x;
    circle.node.dataset.y = y;
    circle.node.dataset.rx = width;
    circle.node.dataset.ry = height;

    this.addSVGChildElement(circle.node);

    return circle;
  }

  scatterRandomly(node, x, y, rx, ry) {
    const viewBox = this.querySelector("svg").viewBox.baseVal;
    node.setAttribute("fill-opacity", x / viewBox.width);

    const scale = y / (viewBox.height / 2);
    node.setAttribute("rx", rx * scale);
    node.setAttribute("ry", ry * scale);

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

  animateTemperatureOnXAxis(durationSec, onLightUp, { onDone }) {
    this.lightUpWithDelay(0.8, durationSec * 1000, onLightUp);

    this._stars.forEach((star, index) => {
      const animatableStar = animatable(star);
      const opacityAnimationID = this.opacityAnimationID(index);
      const translationAnimationID = this.xTranslationAnimationID(index);

      animatableStar.animateAttribute("fill-opacity", Object.assign({
        id: opacityAnimationID,
        from: star.node.getAttribute("fill-opacity"),
        to: 1
      }, commonAnimationProps(durationSec)));

      animatableStar.animateAttribute("cx", Object.assign({
        id: translationAnimationID,
        values: `${star.node.getAttribute("cx")};${star.node.dataset.x}`
      }, commonAnimationProps(durationSec)));

      animatableStar.beginAnimation(opacityAnimationID);
      animatableStar.beginAnimation(translationAnimationID, () => {
        if (index == 0) {
          onDone();
        }
      });
    });
  }

  animateMagnitudeOnYAxis(durationSec, onLightUp, { onDone }) {
    this.lightUpWithDelay(0.8, durationSec * 1000, onLightUp);

    this._stars.forEach((star, index) => {
      const animatableStar = animatable(star);
      const scaleXAnimationID = this.scaleAnimationID(index, "x");
      const scaleYAnimationID = this.scaleAnimationID(index, "y");
      const translationAnimationID = this.yTranslationAnimationID(index);

      animatableStar.animateAttribute("rx", Object.assign({
        id: scaleXAnimationID,
        from: star.node.getAttribute("rx"),
        to: star.node.dataset.rx
      }, commonAnimationProps(durationSec)));

      animatableStar.animateAttribute("ry", Object.assign({
        id: scaleYAnimationID,
        from: star.node.getAttribute("ry"),
        to: star.node.dataset.ry
      }, commonAnimationProps(durationSec)));

      animatableStar.animateAttribute("cy", Object.assign({
        id: translationAnimationID,
        values: `${star.node.getAttribute("cy")};${star.node.dataset.y}`
      }, commonAnimationProps(durationSec)));

      animatableStar.beginAnimation(scaleXAnimationID);
      animatableStar.beginAnimation(scaleYAnimationID);
      animatableStar.beginAnimation(translationAnimationID, () => {
        if (index == 0) {
          onDone();
        }
      });
    });
  }

  lightUpWithDelay(delayFactor, durationMS, onLightUp) {
    const lightUpDelay = durationMS * delayFactor;
    const lightUpDuration = durationMS * ((1 - delayFactor) * 2);
    this._timerManager.setTimeout(() => {
      onLightUp(lightUpDuration);
    }, lightUpDelay);
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

  scaleAnimationID(index, axis) {
    return `scale-${axis}-animation-${index}`;
  }
}

customElements.define("figure-40-diagram", Figure42Diagram);
