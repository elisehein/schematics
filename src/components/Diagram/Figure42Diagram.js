import BezierEasing from "/helpers/BezierEasing.js";
import Duration from "/helpers/Duration.js";

import { SVGDiagram } from "./Diagram.js";

const commonAnimationProps = duration => ({
  fill: "freeze",
  begin: "indefinite",
  dur: duration.s,
  keyTimes: "0; 1",
  calcMode: "spline",
  keySplines: BezierEasing.easeInOutCubic.smilString
});

/* eslint-disable max-len */
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
/* eslint-enable max-len */

const previewStarCoords = [
  { x: 80, allY: [167] },
  { x: 155, allY: [128, 150] },
  { x: 213, allY: [70] },
  { x: 233, allY: [107, 183, 205] }
];

export default class Figure42Diagram extends SVGDiagram {
  constructor(...args) {
    super(42, ...args);

    this._stars = [];
    this._axisAnimationDuration = new Duration({ seconds: 5 });
    this._reverseAxisAnimationDuration = new Duration({ seconds: 2.2 });
  }

  importDependencies(callback) {
    Promise.all([
      import("/helpers/sequentialActionRunning.js"),
      import("/helpers/random.js"),
      import("/components/SVGShapes/SVGShapeFeatures.js")
    ]).then(modules => {
      this._runActionsSequentially = modules[0].runActionsSequentially;
      this._waitBeforeNextAction = modules[0].waitBeforeNextAction;
      this._randomIntBetween = modules[1].randomIntBetween;
      this._animatable = modules[2].animatable;
      callback();
    });
  }

  drawBeforeCaption({ onDone }) {
    super.drawBeforeCaption();
    this.importDependencies(() => {
      this.drawStars();
      this._runActionsSequentially([
        this._waitBeforeNextAction(1000, this._timerManager),
        this.animateTemperatureOnXAxis.bind(this, false),
        this.animateMagnitudeOnYAxis.bind(this, false),
        this._waitBeforeNextAction(2000, this._timerManager)
      ], onDone);
    });
  }

  drawAfterCaption() {
    this._runActionsSequentially([
      this._waitBeforeNextAction(3000, this._timerManager),
      ({ onDone }) => {
        this._figureBehavior.onDeleteCaption({ onDone: () => {} });
        this._figureBehavior.onLightUp(Duration.oneSec);
        this._figureBehavior.onJitter(Duration.oneSec, { onDone });
      },
      this.animateMagnitudeOnYAxis.bind(this, true),
      this.animateTemperatureOnXAxis.bind(this, true),
      this._waitBeforeNextAction(4000, this._timerManager),
      this.animateTemperatureOnXAxis.bind(this, false),
      this.animateMagnitudeOnYAxis.bind(this, false),
      this._waitBeforeNextAction(2000, this._timerManager),
      this._figureBehavior.onRetypeCaption
    ], this.drawAfterCaption.bind(this));
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
        parseFloat(star.node.dataset.cxAligned),
        parseFloat(star.node.dataset.cyAligned),
        parseFloat(star.node.dataset.rxUnscaled),
        parseFloat(star.node.dataset.ryUnscaled)
      );
    });
  }

  drawStar(cx, cy) {
    const width = 1.5;
    const height = 2;

    const circle = this._svgShapeFactory.getEllipse(cx, cy, width, height);
    circle.fill();
    circle.stroke(0);

    // Keep track of the intended coordinates as we will override them with random ones
    circle.node.dataset.cxAligned = cx;
    circle.node.dataset.cyAligned = cy;
    circle.node.dataset.rxUnscaled = width;
    circle.node.dataset.ryUnscaled = height;

    this.addSVGChildElement(circle.node);

    return circle;
  }

  scatterRandomly(node, cxAligned, cyAligned, rxUnscaled, ryUnscaled) {
    const viewBox = this.querySelector("svg").viewBox.baseVal;
    node.style.filter =
      `drop-shadow(0 0 ${cxAligned / viewBox.width / 10}rem var(--color-highest-contrast))`;
    node.dataset.filter = node.style.filter;

    const scale = cyAligned / (viewBox.height / 2);
    node.dataset.rxScaled = rxUnscaled * scale;
    node.dataset.ryScaled = ryUnscaled * scale;
    node.setAttribute("rx", node.dataset.rxScaled);
    node.setAttribute("ry", node.dataset.ryScaled);

    const randomXTranslation = this.getRandomTranslationWithinBounds(cxAligned, viewBox.width, 7);
    const randomYTranslation = this.getRandomTranslationWithinBounds(cyAligned, viewBox.height, 10);
    node.dataset.xTranslation = randomXTranslation;
    node.dataset.yTranslation = randomYTranslation;
    const transform = `translate(${randomXTranslation} ${randomYTranslation})`;
    node.setAttribute("transform", transform);
  }

  getRandomTranslationWithinBounds(originalValue, bounds, inset) {
    const randomPositiveTranslation = this._randomIntBetween(0, bounds - originalValue - inset);
    const randomNegativeTranslation = this._randomIntBetween(0, originalValue - inset) * -1;
    return Math.random() > 0.5 ? randomPositiveTranslation : randomNegativeTranslation;
  }

  animateTemperatureOnXAxis(reverse, { onDone }) {
    const duration = reverse ? this._reverseAxisAnimationDuration : this._axisAnimationDuration;
    this.lightUpWithDelay(0.8, duration);

    this._stars.forEach((star, index) => {
      const animatableStar = this._animatable(star);
      const translationAnimationID = this.xTranslationAnimationID(index, reverse);
      const existingAnimation = this.querySelector(`#${translationAnimationID}`);

      if (!existingAnimation) {
        this.addXTranslationAnimation(
          star, animatableStar, reverse, duration, translationAnimationID
        );
      }

      star.node.style.transition = `filter ${duration.s}s ${BezierEasing.easeInOutCubic.cssString}`;
      star.node.style.filter = reverse ? star.node.dataset.filter : "none";

      animatableStar.beginAnimation(translationAnimationID, () => {
        if (index == 0) {
          onDone();
        }
      });
    });
  }

  addXTranslationAnimation(star, animatableStar, reverse, duration, animationID) {
    const values = [star.node.dataset.xTranslation, 0];
    const transformValues = array => array.map(translation => (
      `${translation} ${star.node.dataset.yTranslation || 0}`
    ));

    animatableStar.animateTransform("translate", Object.assign({
      id: animationID,
      values: (reverse ? transformValues(values.reverse()) : transformValues(values)).join(";")
    }, commonAnimationProps(duration)));
  }

  animateMagnitudeOnYAxis(reverse, { onDone }) {
    const duration = reverse ? this._reverseAxisAnimationDuration : this._axisAnimationDuration;
    this.lightUpWithDelay(0.8, duration);

    this._stars.forEach((star, index) => {
      const animatableStar = this._animatable(star);
      const scaleXAnimationID = this.scaleAnimationID(index, "x", reverse);
      const scaleYAnimationID = this.scaleAnimationID(index, "y", reverse);
      const translationAnimationID = this.yTranslationAnimationID(index, reverse);

      const existingScaleXAnimation = this.querySelector(`#${scaleXAnimationID}`);
      const existingScaleYAnimation = this.querySelector(`#${scaleYAnimationID}`);
      const existingTranslationAnimation = this.querySelector(`#${translationAnimationID}`);

      if (!existingScaleXAnimation || !existingScaleYAnimation || !existingTranslationAnimation) {
        this.addScaleXAnimation(star, animatableStar, reverse, duration, scaleXAnimationID);
        this.addScaleYAnimation(star, animatableStar, reverse, duration, scaleYAnimationID);
        this.addYTranslationAnimation(
          star, animatableStar, reverse, duration, translationAnimationID
        );
      }

      animatableStar.beginAnimation(scaleXAnimationID);
      animatableStar.beginAnimation(scaleYAnimationID);
      animatableStar.beginAnimation(translationAnimationID, () => {
        if (index == 0) {
          onDone();
        }
      });
    });
  }

  addScaleXAnimation(star, animatableStar, reverse, duration, animationID) {
    const rxValues = [star.node.dataset.rxScaled, star.node.dataset.rxUnscaled];
    animatableStar.animateAttribute("rx", Object.assign({
      id: animationID,
      values: (reverse ? rxValues.reverse() : rxValues).join(";")
    }, commonAnimationProps(duration)));
  }

  addScaleYAnimation(star, animatableStar, reverse, duration, animationID) {
    const ryValues = [star.node.dataset.ryScaled, star.node.dataset.ryUnscaled];
    animatableStar.animateAttribute("ry", Object.assign({
      id: animationID,
      values: (reverse ? ryValues.reverse() : ryValues).join(";")
    }, commonAnimationProps(duration)));
  }

  addYTranslationAnimation(star, animatableStar, reverse, duration, animationID) {
    const values = [star.node.dataset.yTranslation, 0];
    const transformValues = array => array.map(translation => (
      `0 ${translation}`
    ));

    animatableStar.animateTransform("translate", Object.assign({
      id: animationID,
      values: (reverse ? transformValues(values.reverse()) : transformValues(values)).join(";")
    }, commonAnimationProps(duration)));
  }

  lightUpWithDelay(delayFactor, duration) {
    const lightUpDuration = new Duration({ milliseconds: duration.ms * ((1 - delayFactor) * 2) });
    this._timerManager.setTimeout(() => {
      this._figureBehavior.onLightUp(lightUpDuration);
    }, duration.ms * delayFactor);
  }

  xTranslationAnimationID(index, reverse) {
    return `x-translation-animation-${index}-${reverse ? "reverse" : ""}`;
  }

  yTranslationAnimationID(index, reverse) {
    return `y-translation-animation-${index}-${reverse ? "reverse" : ""}`;
  }

  scaleAnimationID(index, axis, reverse) {
    return `scale-${axis}-animation-${index}-${reverse ? "reverse" : ""}`;
  }
}

customElements.define("figure-42-diagram", Figure42Diagram);
