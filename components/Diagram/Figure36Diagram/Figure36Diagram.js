import Diagram from "../Diagram.js";
import { Circle } from "../../SVGShapes/SVGShapes.js";
import PendulumArm from "./PendulumArm.js";
import PendulumTrajectoryArrow from "./PendulumTrajectoryArrow.js";

import { runActionsSequentially, waitBeforeNextAction } from "/helpers/sequentialActionRunning.js";
import BezierEasing from "/helpers/BezierEasing.js";

export default class Figure36Diagram extends Diagram {
  constructor(preview) {
    super(36, preview);

    this._pendulumLength = 200;
    this._circleRadius = 20;
    this._initialAngle = 30;

    // The offset in the end is to nudge it slightly towards the top to make room for
    // the dashed arrow
    const offset = 15;
    this._anchorPoint = { x: 150, y: (300 - this._pendulumLength) / 2 - offset };

    this._swingDurationSec = 2;
    this._swingEasing = new BezierEasing(0.4, 0, 0.6, 1);
    this._totalSwings = 30;
  }

  drawBeforeCaption({ onDone }) {
    this.drawAnchor();
    this._swingingArm = this.drawPendulumArm(this._initialAngle);
    this._arrow = this.drawArrow();

    runActionsSequentially([
      waitBeforeNextAction(1000, this._timerManager),
      this._arrow.appearInSteps.bind(this._arrow, 3000, this._timerManager),
      waitBeforeNextAction(1000, this._timerManager)
    ], onDone);
  }

  drawAfterCaption({ onLightUp }) {
    this.enableUserTriggeredSwinging(onLightUp);
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

  enableUserTriggeredSwinging(onLightUp) {
    this._swingingArm.onClick(() => {
      this._arrow.disappearWithEasing(this._swingEasing, this._swingDurationSec);

      this._swingingArm.swing(this._totalSwings, this._swingEasing, this._swingDurationSec, {
        onSwing: (index, angle) => {
          if (index == 0) {
            this.drawPendulumArm(angle);
          }

          // Only light up on those swings where the pendulum still touches its echo
          if (index % 2 != 0 && index <= 9) {
            this.lightUpJustBeforeNextSwing(index, onLightUp);
          }
        }
      });
    });
  }

  drawPendulumArm(rotationAngle) {
    const arm = new PendulumArm(this._anchorPoint, rotationAngle, this._pendulumLength, this._circleRadius);
    this.addSVGChildElement(arm.node);
    return arm;
  }

  drawAnchor() {
    const { x, y } = this._anchorPoint;
    const circle = new Circle(x, y, this._circleRadius);
    circle.stroke();
    this.addSVGChildElement(circle.node);
  }

  lightUpJustBeforeNextSwing(index, onLightUp) {
    // 11 is a magic number – the final swing where the swinging pendulum still reaches the echo
    const lightUpDuration = 1000 - ((index - 1) * 100); // Gradually less time to light up
    const msUntilJustBeforeNextSwing = this._swingDurationSec * 1000 - (lightUpDuration / 2);
    this._timerManager.setTimeout(() => onLightUp(lightUpDuration), msUntilJustBeforeNextSwing);
  }
}

customElements.define("figure-36-diagram", Figure36Diagram);
