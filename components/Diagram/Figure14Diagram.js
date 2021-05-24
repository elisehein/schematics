import Diagram from "./Diagram.js";
import { Line, Path, TypingText, Text } from "../SVGShapes/SVGShapes.js";
import { runActionsSequentially, waitBeforeNextAction } from "/helpers/sequentialActionRunning.js";
import BezierEasing from "../../helpers/BezierEasing.js";

export default class Figure14Diagram extends Diagram {
  constructor() {
    super(14);

    this._timeAxisInitialCoords = [{ x: 120, y: 100 }, { x: 170, y: 100 }];
    this._timeAxisFinalCoords = [{ x: 150, y: 220 }, { x: 150, y: 30 }];

    this._yAxisInitialCoords = [{ x: 120, y: 100 }, { x: 120, y: 220 }];
    this._yAxisFinalCoords = [{ x: 150, y: 220 }, { x: 200, y: 260 }];

    this._xAxisInitialCoords = [{ x: 120, y: 100 }, { x: 240, y: 100 }];
    this._xAxisFinalCoords = [{ x: 150, y: 220 }, { x: 250, y: 205 }];
  }

  drawBeforeCaption({ onDone }) {
    this.animateAxes(onDone);
  }

  drawAfterCaption() {
    this._timerManager.setTimeout(() => {
      const spiral = this.drawHiddenSpiral();
      spiral.animateStroke("10s", "linear");
    }, 1000);
  }

  animateAxes(onDone) {
    this._yAxis = this.drawAxis(...this._yAxisInitialCoords);
    this._xAxis = this.drawAxis(...this._xAxisInitialCoords);

    runActionsSequentially([
      waitBeforeNextAction(1500, this._timerManager),
      this.switchPerspective.bind(this),
      this.drawLabels.bind(this),
      waitBeforeNextAction(1000, this._timerManager)
    ], onDone);
  }

  switchPerspective({ onDone }) {
    // We delay drawing the time axis until just before animation so that the arrowhead doesn't
    // look out of place.
    this._timeAxis = this.drawAxis(...this._timeAxisInitialCoords);

    const dur = 3;

    // Since each element should animate for the same duration, it doesn't matter which one
    // the onDone event is attached to.
    this.animateAxis(this._timeAxis, this._timeAxisInitialCoords, this._timeAxisFinalCoords, dur);
    this.animateAxis(this._yAxis, this._yAxisInitialCoords, this._yAxisFinalCoords, dur);
    this.animateAxis(this._xAxis, this._xAxisInitialCoords, this._xAxisFinalCoords, dur, onDone);
  }

  drawAxis(startCoords, endCoords, animationDurationSec = 0, { onDone } = {}) {
    const axis = new Line(startCoords, endCoords);
    axis.stroke();
    this.addSVGChildElement(axis.node);

    if (animationDurationSec == 0) {
      axis.addArrowHead(this.registerMarker.bind(this));
      // eslint-disable-next-line no-unused-expressions
      onDone && onDone();
      return axis;
    }

    this.animateAxis(axis, [startCoords, startCoords], [startCoords, endCoords], animationDurationSec, onDone);
    return axis;
  }

  animateAxis(axis, fromPoints, toPoints, animationDurationSec, onDone = () => {}) {
    const pointToValue = ({ x, y }) => `${x},${y}`;

    axis.animateAttribute("points", {
      from: fromPoints.map(pointToValue).join(" "),
      to: toPoints.map(pointToValue).join(" "),
      dur: animationDurationSec,
      calcMode: "spline",
      keyTimes: "0; 1",
      keySplines: (new BezierEasing(0.33, 1, 0.68, 1)).smilString,
      fill: "freeze",
      begin: "indefinite"
    });

    axis.beginAnimation(null, () => {
      axis.addArrowHead(this.registerMarker.bind(this));
      // eslint-disable-next-line no-unused-expressions
      onDone && onDone();
    });
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
