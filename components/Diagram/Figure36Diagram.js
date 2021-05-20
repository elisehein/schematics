import Diagram from "./Diagram.js";
import { Circle, Line, Path } from "../SVGShapes/SVGShapes.js";

import { runActionsSequentially, waitBeforeNextAction } from "/helpers/sequentialActionRunning.js";
import { getArcPathD } from "/helpers/arcCalculations.js";

export default class Figure36Diagram extends Diagram {
  constructor() {
    super(36);

    this._pendulumLength = 200;
    this._markerRadius = 20;
    this._initialAngle = 30;

    // -10 in the end is to nudge it slightly towards the top to make room for
    // the dashed arrow
    const offset = 10;
    this._anchorPoint = { x: 150, y: (300 - this._pendulumLength) / 2 - offset };

    this._swingDurationSec = 2;
    this._swingEasing = ".4 0 .6 1"
    this._totalSwings = 30;
    this._angleChangeStep = this._initialAngle / (this._totalSwings - 1);
  }

  drawBeforeCaption({ onDone }) {
    this.drawAnchor();
    this.drawSwingingArm();
    onDone();
  }

  drawAfterCaption() {
    super.drawAfterCaption();

    runActionsSequentially([
      waitBeforeNextAction(1000),
      this.animateDashedArrowInSteps.bind(this, 18),
      this.enableUserTriggeredSwinging.bind(this),
      waitBeforeNextAction(1000),
      this.configurePulseAnimation.bind(this)
    ]);
  }

  animateDashedArrowInSteps(numberOfSteps, { onDone }) {
    const { dashedArrow, endAngle, arcLengthForSingleStep } = this.drawInitialDashedArrow(numberOfSteps);
    this._dashedArrow = dashedArrow;

    const setArrowArcStartAngle = startAngle => {
      return (objectWithDoneHandler) => {
        dashedArrow.node.setAttribute("d", this.getArrowArcD({ startAngle, endAngle }));
        objectWithDoneHandler.onDone();
      }
    }

    const steppedArrowIncrementActions = Array(numberOfSteps - 1).fill().map((_, index) => {
      return [
        waitBeforeNextAction(200),
        setArrowArcStartAngle(endAngle - ((index + 2) * arcLengthForSingleStep)),
      ];
    }).flat();

    runActionsSequentially(steppedArrowIncrementActions, onDone);
  }

  drawInitialDashedArrow(intendedAnimationSteps) {
    const finalAngles = this.getArrowArcAngles(10);
    const arcLength = finalAngles.endAngle - finalAngles.startAngle;
    const arcLengthForSingleStep = arcLength / intendedAnimationSteps;

    const arc = this.getArrowArc({
      startAngle: finalAngles.endAngle - arcLengthForSingleStep,
      endAngle: finalAngles.endAngle
    });

    arc.addArrowHead(this.registerMarker.bind(this));
    arc.stroke();
    arc.dash(5);
    this.addSVGChildElement(arc.node);

    return { dashedArrow: arc, endAngle: finalAngles.endAngle, arcLengthForSingleStep };
  }

  drawOverlayArrow() {
    const arc = this.getArrowArc();
    arc.stroke(8, "var(--color-page-bg)");
    const cssEasing = `cubic-bezier(${this._swingEasing.split(" ").join(",")})`;
    arc.animateStroke(`${this._swingDurationSec}s`, cssEasing);
    this.addSVGChildElement(arc.node);
    return arc;
  }

  getArrowArc(angles) {
    return new Path(this.getArrowArcD(angles || this.getArrowArcAngles()));
  }

  getArrowArcAngles(insetAngle = 0) {
    return {
      startAngle: 180 - this._initialAngle + insetAngle,
      endAngle: 180 + this._initialAngle - insetAngle
    }
  }

  getArrowArcD({ startAngle, endAngle }) {
    const arcRadius = this._pendulumLength + (this._markerRadius * 2) + 10;
    return getArcPathD({ radius: arcRadius, ...this._anchorPoint }, { startAngle, endAngle })
  }

  addRotation(node, angle) {
    node.setAttribute(
      "transform",
      `rotate(${angle} ${this._anchorPoint.x} ${this._anchorPoint.y})`
    );
  }

  drawSwingingArm() {
    const rotationAngle = this._initialAngle;
    this._swingingArm = this.drawArm(rotationAngle);
    this._swingTriggerCircle = this.drawEndOfArmCircle(rotationAngle);
    this.configureSwingAnimation(this._swingingArm);
    this.configureSwingAnimation(this._swingTriggerCircle);
  }

  drawTriggerOverlayCircle() {
    const circle = this.drawEndOfArmCircle(this._initialAngle);
    circle.node.style.pointerEvents = "none";
    return circle
  }

  enableUserTriggeredSwinging({ onDone }) {
    this._triggerOverlayCircle = this.drawTriggerOverlayCircle();
    const trigger = this._swingTriggerCircle;
    trigger.node.style.cursor = "pointer";

    const toggleFill = (isFilled) => {
      trigger.node.style.fill = isFilled ? "currentcolor" : "transparent";
    }
    const fill = toggleFill.bind(this, true);
    const unfill = toggleFill.bind(this, false);

    trigger.node.addEventListener("mouseover", fill);
    trigger.node.addEventListener("mouseleave", unfill);

    trigger.node.addEventListener("click", () => {
      unfill();
      trigger.node.removeEventListener("mouseover", fill);
      trigger.node.removeEventListener("mouseleave", unfill);
      trigger.node.style.cursor = "default";
      this._triggerOverlayCircle.node.remove();

      const overlayArrow = this.drawOverlayArrow();

      this.beginSwinging({ afterFirstSwing: () => {
        this._dashedArrow.node.remove();
        overlayArrow.node.remove();
        this.drawStaticArm();
      }})
    });

    onDone();
  }

  beginSwinging({ afterFirstSwing }) {
    this._swingingArm.beginAnimation();
    this._swingTriggerCircle.beginAnimation();
    setTimeout(afterFirstSwing, this._swingDurationSec * 1000);
  }

  drawStaticArm() {
    const rotationAngle = (this._initialAngle - this._angleChangeStep) * -1;
    this.drawArm(rotationAngle);
    this.drawEndOfArmCircle(rotationAngle);
  }

  drawArm(rotationAngle) {
    const arm = this.getDownwardArm();
    this.addRotation(arm.node, rotationAngle);
    this.addSVGChildElement(arm.node);
    return arm;
  }

  drawEndOfArmCircle(rotationAngle) {
    const pointAtMarker = this._swingingArm.node.getPointAtLength(this._pendulumLength);
    pointAtMarker.y += this._markerRadius;

    const circle = this.getCircle(pointAtMarker.x, pointAtMarker.y);
    circle.stroke();
    this.addRotation(circle.node, rotationAngle);
    this.addSVGChildElement(circle.node);
    return circle;
  }

  getDownwardArm() {
    return new Line(
      this._anchorPoint,
      { x: this._anchorPoint.x, y: this._anchorPoint.y + this._pendulumLength }
    )
  }

  drawAnchor() {
    const { x, y } = this._anchorPoint;
    const circle = new Circle(x, y, this._markerRadius);
    circle.stroke();
    this.addSVGChildElement(circle.node);
  }

  getCircle(cx, cy) {
    const circle = new Circle(cx, cy, this._markerRadius);
    circle.stroke();
    return circle;
  }

  configureSwingAnimation(node) {
    const rotationValue = deg => `${deg} ${this._anchorPoint.x} ${this._anchorPoint.y}`;
    const swingAngle = swingIndex => this._angleChangeStep * (this._totalSwings - (swingIndex + 1));

    const rotationValues = Array(this._totalSwings).fill().map((_, swingIndex) => {
      const mirroringFactor = swingIndex % 2 == 0 ? 1 : -1;
      return rotationValue(swingAngle(swingIndex) * mirroringFactor);
    });

    const times = Array(this._totalSwings).fill().map((value, index) => {
      return 0 + (1 / (this._totalSwings - 1) * index);
    });

    node.animateTransform("rotate", {
      values: rotationValues.join("; "),
      keyTimes: times.join("; "),
      calcMode: "spline",
      keySplines: Array(this._totalSwings - 1).fill(this._swingEasing).join("; "),
      dur: this._totalSwings * this._swingDurationSec,
      begin: "indefinite",
      repeatCount: "1",
      fill: "freeze"
    });
  }

  configurePulseAnimation() {
    const keyTimes = "0; 0.3; 1";
    const dur = 2.2;
    const begin = "2s;"
    const pulseEasing = ".25 1 .5 1";

    this._triggerOverlayCircle.animateAttribute("r", {
      begin,
      dur,
      repeatCount: "indefinite",
      values: `${this._markerRadius}; ${this._markerRadius * 1.7}; ${this._markerRadius}`,
      calcMode: "spline",
      keySplines: `${pulseEasing}; 0 0 1 1`,
      keyTimes
    });

    this._triggerOverlayCircle.animateAttribute({ type: "xml", name: "stroke-opacity" }, {
      begin,
      dur,
      values: "1; 0; 0",
      repeatCount: "indefinite",
      keyTimes
    });
  }
}

customElements.define("figure-36-diagram", Figure36Diagram);