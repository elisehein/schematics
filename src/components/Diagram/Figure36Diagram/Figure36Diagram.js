import { SVGDiagram } from "../Diagram.js";
import PendulumArm from "./PendulumArm.js";

import BezierEasing from "/helpers/BezierEasing.js";

import Duration, { registerDurationConvenienceInits } from "/helpers/Duration.js";
registerDurationConvenienceInits();

export default class Figure36Diagram extends SVGDiagram {
  constructor(...args) {
    super(36, ...args);

    this._pendulumLength = 200;
    this._circleRadius = 20;
    this._initialAngle = 30;
    this._arrowOffsetAngle = 10;

    this._swingDuration = (2).seconds();
    this._swingEasing = new BezierEasing(0.4, 0, 0.6, 1);
    this._totalSwings = 30;
  }

  async importDependencies() {
    const modules = await Promise.all([
      import("/helpers/sequentialActionRunning.js"),
      import("./PendulumTrajectoryArrow.js")
    ]);

    this._runActionsSequentially = modules[0].runActionsSequentially;
    this._waitBeforeNextAction = modules[0].waitBeforeNextAction;
    this.PendulumTrajectoryArrow = modules[1].default;
  }

  drawThumbnail() {
    this._pendulumLength = 120;
    this.drawAnchor();
    this.drawPendulumArm(0);
    this.drawPendulumArm(this._initialAngle * -1);
  }

  async drawBeforeCaption({ onDone }) {
    super.drawBeforeCaption();
    this.drawAnchor();
    this._swingingArm = this.drawPendulumArm(this._initialAngle);

    await this.importDependencies();

    this._arrow = this.drawArrow({
      startAngle: 180 - this._initialAngle + this._arrowOffsetAngle,
      endAngle: 180 + this._initialAngle - this._arrowOffsetAngle
    });

    this._runActionsSequentially([
      this._waitBeforeNextAction(1000, this._timerManager),
      this._arrow.appearInSteps.bind(
        this._arrow, (3).seconds(), this._timerManager
      ),
      this._waitBeforeNextAction(1000, this._timerManager)
    ], onDone);
  }

  drawAfterCaption() {
    this.enableUserTriggeredSwinging();
  }

  drawArrow(angles) {
    const arrowArcRadius = this._pendulumLength + (this._circleRadius * 2) + 10;
    const arrow = new this.PendulumTrajectoryArrow(
      this._svgShapeFactory, this.anchorPoint, arrowArcRadius, angles
    );
    this.addSVGChildElement(arrow.node);
    return arrow;
  }

  enableUserTriggeredSwinging() {
    this._swingingArm.onClick(() => {
      this.hideArrow();

      this._swingingArm.swing(this._totalSwings, this._swingEasing, this._swingDuration, {
        onSwing: (index, angle) => {
          if (index == 0) {
            this.drawPendulumArm(angle);
          }

          // Only light up on those swings where the pendulum still touches its echo
          if (index % 2 != 0 && index <= 9) {
            this.lightUpJustBeforeNextSwing(index);
          }
        }
      });
    });
  }

  hideArrow() {
    // The arrow needs to disappear *slightly* later and quicker than the swing
    // to account for its angle offset compared to the pendulum
    const totalAnglesCovered = 2 * this._initialAngle;
    const arrowDisappearanceDelay = new Duration({
      seconds: (this._arrowOffsetAngle / totalAnglesCovered) * this._swingDuration.s
    });
    const arrowDisappearanceDuration = new Duration({
      seconds: this._swingDuration.s - (arrowDisappearanceDelay.s * 2)
    });
    this._timerManager.setTimeout(() => {
      this._arrow.disappearWithEasing(this._swingEasing, arrowDisappearanceDuration);
    }, arrowDisappearanceDelay.ms);
  }

  drawPendulumArm(rotationAngle) {
    const arm = new PendulumArm(
      this._svgShapeFactory, this.anchorPoint, rotationAngle, this._pendulumLength, this._circleRadius // eslint-disable-line max-len
    );
    this.addSVGChildElement(arm.node);
    return arm;
  }

  drawAnchor() {
    const { x, y } = this.anchorPoint;
    const circle = this._svgShapeFactory.getCircle(x, y, this._circleRadius);
    circle.stroke();
    this.addSVGChildElement(circle.node);
  }

  lightUpJustBeforeNextSwing(index) {
    // 11 is a magic number – the final swing where the swinging pendulum still reaches the echo
    const lightUpDuration = (1000 - ((index - 1) * 100)).milliseconds();
    const msUntilJustBeforeNextSwing = this._swingDuration.ms - (lightUpDuration.ms / 2);
    const lightUpDelay = msUntilJustBeforeNextSwing.milliseconds();
    this._timerManager.setTimeout(() => {
      this._figureBehavior.onLightUp(lightUpDuration);
    }, lightUpDelay.ms);
  }

  get anchorPoint() {
    // The offset in the end is to nudge it slightly towards the top to make room for
    // the dashed arrow
    const offset = 15;
    return { x: 150, y: (300 - this._pendulumLength) / 2 - offset };
  }
}

customElements.define("figure-36-diagram", Figure36Diagram);
