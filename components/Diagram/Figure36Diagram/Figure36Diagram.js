import Diagram from "../Diagram.js";
import { Circle, Path } from "../../SVGShapes/SVGShapes.js";
import PendulumArm from "./PendulumArm.js";

import { runActionsSequentially, waitBeforeNextAction } from "/helpers/sequentialActionRunning.js";
import { getArcPathD } from "/helpers/arcCalculations.js";

export default class Figure36Diagram extends Diagram {
  constructor() {
    super(36);

    this._pendulumLength = 200;
    this._circleRadius = 20;
    this._initialAngle = 30;

    // -10 in the end is to nudge it slightly towards the top to make room for
    // the dashed arrow
    const offset = 10;
    this._anchorPoint = { x: 150, y: (300 - this._pendulumLength) / 2 - offset };

    this._swingDurationSec = 2;
    this._swingEasing = ".4 0 .6 1"
    this._totalSwings = 30;
  }

  drawBeforeCaption({ onDone }) {
    this.drawAnchor();
    this._swingingArm = this.drawSwingingArm();
    onDone();
  }

  drawAfterCaption() {
    super.drawAfterCaption();

    runActionsSequentially([
      waitBeforeNextAction(1000),
      this.animateDashedArrowInSteps.bind(this, 18),
    ], () => {
      this.enableUserTriggeredSwinging();
    });
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
    const arcRadius = this._pendulumLength + (this._circleRadius * 2) + 10;
    return getArcPathD({ radius: arcRadius, ...this._anchorPoint }, { startAngle, endAngle })
  }

  enableUserTriggeredSwinging() {
    this._swingingArm.onClick(() => {
      const overlayArrow = this.drawOverlayArrow();

      this._swingingArm.beginSwinging({
        atFirstAmplitude: (angle) => {
          this._dashedArrow.node.remove();
          overlayArrow.node.remove();
          this.drawPendulumArm(angle);
        }
      });
    });
  }

  drawSwingingArm() {
    const swingingArm = this.drawPendulumArm(this._initialAngle);
    swingingArm.configureSwingAnimation(this._totalSwings, this._swingEasing, this._swingDurationSec);
    return swingingArm;
  }

  drawPendulumArm(rotationAngle) {
    return new PendulumArm(this.svgNode, this._anchorPoint, rotationAngle, this._pendulumLength, this._circleRadius);
  }

  drawAnchor() {
    const { x, y } = this._anchorPoint;
    const circle = new Circle(x, y, this._circleRadius);
    circle.stroke();
    this.addSVGChildElement(circle.node);
  }
}

customElements.define("figure-36-diagram", Figure36Diagram);