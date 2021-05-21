import Diagram from "../Diagram.js";
import { Circle } from "../../SVGShapes/SVGShapes.js";
import PendulumArm from "./PendulumArm.js";
import PendulumTrajectoryArrow from "./PendulumTrajectoryArrow.js";

import { runActionsSequentially, waitBeforeNextAction } from "/helpers/sequentialActionRunning.js";

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

    const arrow = this.drawArrow();

    runActionsSequentially([
      waitBeforeNextAction(1000),
      arrow.appearInSteps,
    ], () => {
      this.enableUserTriggeredSwinging(arrow);
    });
  }

  drawArrow() {
    const arrowArcRadius = this._pendulumLength + (this._circleRadius * 2) + 10;
    const arrow = new PendulumTrajectoryArrow(this._anchorPoint, arrowArcRadius, {
      startAngle: 180 - this._initialAngle + 10,
      endAngle: 180 + this._initialAngle - 10
    }, this.registerMarker.bind(this));
    this.addSVGChildElement(arrow.node);
    return arrow;
  }

  enableUserTriggeredSwinging(arrow) {
    this._swingingArm.onClick(() => {
      arrow.disappearWithEasing(this._swingEasing, this._swingDurationSec);

      this._swingingArm.beginSwinging({
        atFirstAmplitude: (angle) => this.drawPendulumArm(angle)
      });
    });
  }

  drawSwingingArm() {
    const swingingArm = this.drawPendulumArm(this._initialAngle);
    swingingArm.configureSwingAnimation(this._totalSwings, this._swingEasing, this._swingDurationSec);
    return swingingArm;
  }

  drawPendulumArm(rotationAngle) {
    const arm = PendulumArm(this._anchorPoint, rotationAngle, this._pendulumLength, this._circleRadius);
    this.addSVGChildElement(arm.node);
    return arm;
  }

  drawAnchor() {
    const { x, y } = this._anchorPoint;
    const circle = new Circle(x, y, this._circleRadius);
    circle.stroke();
    this.addSVGChildElement(circle.node);
  }
}

customElements.define("figure-36-diagram", Figure36Diagram);