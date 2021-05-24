import Diagram from "./Diagram.js";
import { Line, Path, TypingText, Text } from "../SVGShapes/SVGShapes.js";
import { runActionsSequentially, waitBeforeNextAction } from "/helpers/sequentialActionRunning.js";
import BezierEasing from "../../helpers/BezierEasing.js";

export default class Figure14Diagram extends Diagram {
  constructor() {
    super(14);

    this._timeAxis = {
      initialCoords: [{ x: 120, y: 100 }, { x: 180, y: 100 }],
      finalCoords: [{ x: 150, y: 220 }, { x: 150, y: 30 }]
    };

    this._yAxis = {
      initialCoords: [{ x: 120, y: 100 }, { x: 120, y: 220 }],
      finalCoords: [{ x: 150, y: 220 }, { x: 200, y: 260 }]
    };

    this._xAxis = {
      initialCoords: [{ x: 120, y: 100 }, { x: 240, y: 100 }],
      finalCoords: [{ x: 150, y: 220 }, { x: 250, y: 205 }]
    };
  }

  drawBeforeCaption({ onDone }) {
    const animationStepDurationSec = 3;
    this.animateAxes(animationStepDurationSec, onDone);
  }

  drawAfterCaption() {
    this._timerManager.setTimeout(() => {
      const spiral = this.drawHiddenSpiral();
      spiral.animateStroke("10s", "linear");
    }, 1000);
  }

  animateAxes(animationStepDurationSec, onAllDone) {
    runActionsSequentially([
      this.draw2DXY.bind(this, animationStepDurationSec),
      this.switchPerspective.bind(this, animationStepDurationSec),
      this.drawLabels.bind(this),
      waitBeforeNextAction(1000, this._timerManager)
    ], onAllDone);
  }

  draw2DXY(durationSec, { onDone }) {
    this._yAxis.axis = this.drawAxis(...this._yAxis.initialCoords, durationSec);
    this._xAxis.axis = this.drawAxis(...this._xAxis.initialCoords, durationSec, { onDone });
  }

  switchPerspective(durationSec, { onDone }) {
    // We delay drawing the time axis until just before animation so that the arrowhead doesn't
    // look out of place.
    this._timeAxis.axis = this.drawAxis(...this._timeAxis.initialCoords);

    [this._timeAxis, this._yAxis, this._xAxis].forEach((axisData, index) => {
      // Since each element should animate for the same duration, it doesn't matter which one
      // the onDone event is attached to.
      const onAxisAnimated = index == 0 ? onDone : () => {};
      this.animateAxis(axisData.axis, axisData.initialCoords, axisData.finalCoords, durationSec, onAxisAnimated);
    });
  }

  drawAxis(startCoords, endCoords, animationDurationSec = 0, { onDone } = {}) {
    const axis = new Line(startCoords, endCoords);
    axis.stroke();
    this.addSVGChildElement(axis.node);

    if (animationDurationSec == 0) {
      // eslint-disable-next-line no-unused-expressions
      onDone && onDone();
      return axis;
    }

    this.animateAxis(axis, [startCoords, startCoords], [startCoords, endCoords], animationDurationSec, onDone);
    return axis;
  }

  animateAxis(axis, fromCoords, toCoords, animationDurationSec, onDone = () => {}) {
    const pointToValue = ({ x, y }) => `${x},${y}`;
    const from = fromCoords.map(pointToValue).join(" ");
    const to = toCoords.map(pointToValue).join(" ");
    const id = `axis-animation-${(from + to).replace(/[,\.\s]/g, "")}`;

    axis.animateAttribute("points", {
      from,
      to,
      id,
      dur: animationDurationSec,
      fill: "freeze",
      begin: "indefinite",
      calcMode: "spline",
      keyTimes: "0; 1",
      keySplines: BezierEasing.easeOutSine.smilString
    });

    // Add the arrowheads slightly after the beginning of each animation
    // because otherwise the first thing we see is an arrowhead not attached to a line.
    this._timerManager.setTimeout(() => {
      axis.addArrowHead(this.registerMarker.bind(this));
    }, animationDurationSec * 1000 / 25);

    axis.beginAnimation(id, onDone);
  }

  drawLabels({ onDone }) {
    runActionsSequentially([
      this.drawLabel.bind(this, "X", { x: 257, y: 207 }, true),
      this.drawLabel.bind(this, "Y", { x: 207, y: 262 }, true),
      this.drawLabel.bind(this, "Time", { x: 157, y: 36 }, true)
    ], onDone);
  }

  drawLabel(text, coords, animated = false, { onDone } = {}) {
    let label;
    if (animated) {
      label = new TypingText(text, coords, 1);
      this.addSVGChildElement(label.node);
      label.animateTyping(null, onDone);
    } else {
      label = new Text(text, coords);
      this.addSVGChildElement(label.node);
    }

    return label;
  }

  drawHiddenSpiral() {
    const spiral = new Path("M210,215 \
                             C 210,175, 90,175, 90,195 \
                             C 90,215, 210,215, 210,175 \
                             C 210,135, 90,135, 90,155 \
                             C 90,175, 210,175, 210,135 \
                             C 210,95, 90,95, 90,115 \
                             C 90,135, 210,135, 210,95");
    spiral.stroke(2);
    this.addSVGChildElement(spiral.node);
    return spiral;
  }
}

customElements.define("figure-14-diagram", Figure14Diagram);
