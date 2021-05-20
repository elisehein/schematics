import Diagram from "./Diagram.js";
import { Marker, Circle, Line, Path } from "../SVGShapes/SVGShapes.js";

import { runActionsSequentially, waitBeforeNextAction } from "/helpers/sequentialActionRunning.js";
import { getArcPathD } from "/helpers/arcCalculations.js";

const markerID = "circle-marker";
const anchorMarkerID = "circle-marker--anchor";
const swingAnimationID = "swing-animation"

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

    this._swingDuration = 2;
    this._swingEasing = ".4 0 .6 1"
    this._totalSwings = 30;
    this._angleChangeStep = this._initialAngle / (this._totalSwings - 1);

  }

  drawBeforeCaption({ onDone }) {
    this._markerCircles = {};
    this.defineCircleMarker({ anchor: false });
    this.defineCircleMarker({ anchor: true });

    this._swingingArm = this.drawSwingingArm();
    onDone();
  }

  drawAfterCaption() {
    super.drawAfterCaption();

    const markerClickOverlay = this.drawMarkerClickOverlay();

    const animateDashedArrowInSteps = () => {
      this.animateDashedArrowInSteps({ numberOfSteps: 18, onAllDone: arrowArc => {
        this.addMarkerOverlayEventHandlers(markerClickOverlay, arrowArc);
        setTimeout(() => {
          this.configurePulseAnimation(markerClickOverlay);
        }, 1000);
      }});
    }

    setTimeout(animateDashedArrowInSteps, 1000);
  }

  animateDashedArrowInSteps({ numberOfSteps, onAllDone }) {
    const { arrowArc, endAngle, arcLengthForSingleStep } = this.drawInitialDashedArrow(numberOfSteps);

    const setArrowArcStartAngle = startAngle => {
      return ({ onDone }) => {
        arrowArc.node.setAttribute("d", this.getArrowArcD({ startAngle, endAngle }));
        onDone();
      }
    }

    const steppedArrowIncrementActions = Array(numberOfSteps - 1).fill().map((_, index) => {
      return [
        waitBeforeNextAction(300),
        setArrowArcStartAngle(endAngle - ((index + 2) * arcLengthForSingleStep)),
      ];
    }).flat();

    runActionsSequentially(steppedArrowIncrementActions, onAllDone.bind(this, arrowArc));
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

    return { arrowArc: arc, endAngle: finalAngles.endAngle, arcLengthForSingleStep };
  }

  drawOverlayArrow() {
    const arc = this.getArrowArc();
    arc.stroke(8, "var(--color-page-bg)");
    const cssEasing = `cubic-bezier(${this._swingEasing.split(" ").join(",")})`;
    arc.animateStroke(`${this._swingDuration}s`, cssEasing);
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

  setMarkers(armNode, anchor = false) {
    const markerURL = id => `url(#${id})`;
    armNode.setAttribute("marker-end", markerURL(markerID));

    if (anchor) {
      armNode.setAttribute("marker-start", markerURL(anchorMarkerID));
    }
  }

  drawSwingingArm() {
    const swingingArm = this.getDownwardArm();
    this.setMarkers(swingingArm.node, true);
    this.addRotation(swingingArm.node, this._initialAngle);
    this.configureSwingAnimation(swingingArm);
    this.addSVGChildElement(swingingArm.node);
    return swingingArm;
  }

  drawMarkerClickOverlay() {
    const pointAtMarker = this._swingingArm.node.getPointAtLength(this._pendulumLength);
    pointAtMarker.y += this._markerRadius;

    const markerClickOverlay = this.getMarkerCircle(pointAtMarker.x, pointAtMarker.y);
    markerClickOverlay.node.style.cursor = "pointer";
    this.addRotation(markerClickOverlay.node, this._initialAngle);
    this.addSVGChildElement(markerClickOverlay.node);

    return markerClickOverlay;
  }

  addMarkerOverlayEventHandlers(markerClickOverlay, arrowArc) {
    let overlayArrow;

    const toggleFill = (isFilled) => {
      this._markerCircles[markerID].style.fill = isFilled ? "currentcolor" : "transparent";
    }

    markerClickOverlay.node.addEventListener("mouseover", toggleFill.bind(this, true));
    markerClickOverlay.node.addEventListener("mouseleave", toggleFill.bind(this, false));

    markerClickOverlay.node.addEventListener("click", () => {
      toggleFill(false);
      markerClickOverlay.node.remove();
      overlayArrow = this.drawOverlayArrow();
      this._swingingArm.beginAnimation(swingAnimationID);

      const swingDurationInMS = this._swingDuration * 1000;
      setTimeout(() => {
        arrowArc.node.remove();
        overlayArrow.node.remove();
        this.drawStaticArm();
      }, swingDurationInMS);
    });
  }

  drawStaticArm() {
    const staticArm = this.getDownwardArm();
    this.addRotation(staticArm.node, (this._initialAngle - this._angleChangeStep) * -1);
    this.setMarkers(staticArm.node);
    this.addSVGChildElement(staticArm.node);
  }

  getDownwardArm() {
    return new Line(
      this._anchorPoint,
      { x: this._anchorPoint.x, y: this._anchorPoint.y + this._pendulumLength }
    )
  }

  defineCircleMarker({ anchor }) {
    const diameter = this._markerRadius * 2;
    const safeArea = 4;
    const markerSize = diameter + (safeArea * 2);

    const markerX = markerSize / 2.0;
    const markerY = anchor ? markerX : markerX - this._markerRadius;
    const id = anchor ? anchorMarkerID : markerID;

    const marker = new Marker({
      id,
      width: markerSize,
      height: markerSize,
      x: markerX,
      y: markerY
    });
    const circle = this.getMarkerCircle(this._markerRadius + safeArea, this._markerRadius + safeArea);
    circle.node.style.transition = "fill var(--micro-interaction-animation-duration)";
    this._markerCircles[id] = circle.node;

    marker.addShape(circle.node);
    this.registerMarker(marker.node);
  }

  getMarkerCircle(cx, cy) {
    const circle = new Circle(cx, cy, this._markerRadius);
    circle.stroke();
    return circle;
  }

  configureSwingAnimation(axis) {
    const rotationValue = deg => `${deg} ${this._anchorPoint.x} ${this._anchorPoint.y}`;
    const swingAngle = swingIndex => this._angleChangeStep * (this._totalSwings - (swingIndex + 1));

    const rotationValues = Array(this._totalSwings).fill().map((_, swingIndex) => {
      const mirroringFactor = swingIndex % 2 == 0 ? 1 : -1;
      return rotationValue(swingAngle(swingIndex) * mirroringFactor);
    });

    const times = Array(this._totalSwings).fill().map((value, index) => {
      return 0 + (1 / (this._totalSwings - 1) * index);
    });

    axis.animateTransform("rotate", {
      values: rotationValues.join("; "),
      keyTimes: times.join("; "),
      calcMode: "spline",
      keySplines: Array(this._totalSwings - 1).fill(this._swingEasing).join("; "),
      dur: this._totalSwings * this._swingDuration,
      begin: "indefinite",
      repeatCount: "1",
      fill: "freeze",
      id: swingAnimationID
    });
  }

  configurePulseAnimation(clickOverlay) {
    const keyTimes = "0; 0.3; 1";
    const dur = 2.2;
    const begin = "2s;"
    const pulseEasing = ".25 1 .5 1";

    clickOverlay.animateAttribute("r", {
      begin,
      dur,
      repeatCount: "indefinite",
      values: `${this._markerRadius}; ${this._markerRadius * 1.7}; ${this._markerRadius}`,
      calcMode: "spline",
      keySplines: `${pulseEasing}; 0 0 1 1`,
      keyTimes
    });

    clickOverlay.animateAttribute({ type: "xml", name: "stroke-opacity" }, {
      begin,
      dur,
      values: "1; 0; 0",
      repeatCount: "indefinite",
      keyTimes
    });
  }
}

customElements.define("figure-36-diagram", Figure36Diagram);