import Diagram from "./Diagram.js";
import { Line, Path, TypingText, Text } from "../SVGShapes/SVGShapes.js";
import { runActionsSequentially, waitBeforeNextAction } from "/helpers/sequentialActionRunning.js";
import BezierEasing from "../../helpers/BezierEasing.js";

export default class Figure14Diagram extends Diagram {
  constructor() {
    super(14);
  }

  drawBeforeCaption({ onDone }) {
    this.drawAxes(onDone);
  }

  drawAfterCaption() {
    this._timerManager.setTimeout(() => {
      const spiral = this.drawHiddenSpiral();
      spiral.animateStroke("10s", "linear");
    }, 1000);
  }

  drawAxes(onDone) {
    this.drawAxis({ x: 149, y: 220 }, { x: 200, y: 260 });
    this.drawAxis({ x: 149, y: 220 }, { x: 250, y: 205 });
    this.drawLabel("X", { x: 257, y: 207 });
    this.drawLabel("Y", { x: 207, y: 262 });

    runActionsSequentially([
      waitBeforeNextAction(1000, this._timerManager),
      this.drawAxis.bind(this, { x: 149, y: 220 }, { x: 149, y: 30 }, 2),
      waitBeforeNextAction(500, this._timerManager),
      this.drawLabel.bind(this, "Time", { x: 157, y: 36 }, true),
      waitBeforeNextAction(1000, this._timerManager)
    ], onDone);
  }

  drawAxis(startCoords, endCoords, animationDurationSec = 0, { onDone } = {}) {
    const axis = new Line(startCoords, endCoords);
    axis.stroke();
    this.addSVGChildElement(axis.node);

    if (animationDurationSec == 0) {
      axis.addArrowHead(this.registerMarker.bind(this));
      return;
    }

    this.animateAxis(axis, startCoords, endCoords, animationDurationSec, onDone);
  }

  animateAxis(axis, startCoords, endCoords, animationDurationSec, onDone) {
    const pointToValue = ({ x, y }) => `${x},${y}`;

    axis.animateAttribute("points", {
      from: [startCoords, startCoords].map(pointToValue).join(" "),
      to: [startCoords, endCoords].map(pointToValue).join(" "),
      dur: animationDurationSec,
      calcMode: "spline",
      keyTimes: "0; 1",
      keySplines: (new BezierEasing(0.33, 1, 0.68, 1)).smilString,
      fill: "freeze",
      begin: "indefinite"
    });

    axis.beginAnimation(null, () => {
      axis.addArrowHead(this.registerMarker.bind(this));
      onDone();
    });
  }

  drawLabel(text, coords, animated = false, { onDone } = {}) {
    if (animated) {
      const label = new TypingText(text, coords, 2);
      this.addSVGChildElement(label.node);
      label.animateTyping(null, onDone);
    } else {
      const label = new Text(text, coords);
      this.addSVGChildElement(label.node);
    }
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
