import Diagram from "./Diagram.js";
import { runActionsSequentially, waitBeforeNextAction } from "/helpers/sequentialActionRunning.js";
import BezierEasing from "../../helpers/BezierEasing.js";
import Duration from "../../helpers/Duration.js";

export default class Figure14Diagram extends Diagram {
  constructor(isThumbnail) {
    super(14, isThumbnail);

    this._timeAxis = {
      coords2D: [{ x: 120, y: 100 }, { x: 180, y: 100 }],
      coords3D: [{ x: 150, y: 220 }, { x: 150, y: 30 }]
    };

    this._yAxis = {
      coords2D: [{ x: 120, y: 100 }, { x: 120, y: 220 }],
      coords3D: [{ x: 150, y: 220 }, { x: 200, y: 260 }]
    };

    this._xAxis = {
      coords2D: [{ x: 120, y: 100 }, { x: 240, y: 100 }],
      coords3D: [{ x: 150, y: 220 }, { x: 250, y: 205 }]
    };
  }

  drawThumbnail() {
    this.drawSpiral();
  }

  drawBeforeCaption({ onDone }) {
    const animationStepDuration = new Duration({ seconds: 3 });
    this.animateAxes(animationStepDuration, onDone);
  }

  drawAfterCaption() {
    runActionsSequentially([
      waitBeforeNextAction(1000, this._timerManager),
      this.smoothScrollIntoView.bind(this),
      waitBeforeNextAction(1000, this._timerManager),
      ({ onDone }) => {
        const spiral = this.drawSpiral();
        spiral.animateStroke("10s", "linear");
        onDone();
      }
    ], () => {});
  }

  animateAxes(animationStepDuration, onAllDone) {
    runActionsSequentially([
      this.draw2DXY.bind(this, animationStepDuration),
      this.shiftPerspective.bind(this, animationStepDuration),
      this.drawLabels.bind(this),
      waitBeforeNextAction(1000, this._timerManager)
    ], onAllDone);
  }

  draw2DXY(duration, { onDone }) {
    this._yAxis.axis = this.drawAxis();
    this._xAxis.axis = this.drawAxis();
    this.animateAxisDrawing(this._yAxis.axis, this._yAxis.coords2D, duration);
    this.animateAxisDrawing(this._xAxis.axis, this._xAxis.coords2D, duration, onDone);
  }

  shiftPerspective(duration, { onDone }) {
    this._timeAxis.axis = this.drawAxis();

    [this._timeAxis, this._yAxis, this._xAxis].forEach((axisData, index) => {
      // Since each element should animate for the same duration, it doesn't matter which one
      // the onDone event is attached to.
      const onAxisAnimated = index == 0 ? onDone : () => {};
      this.animateAxis(axisData.axis, axisData.coords2D, axisData.coords3D, duration, onAxisAnimated);
    });
  }

  drawAxis(points = [], addArrowHead = false) {
    // Points are optional because we never show axes in a pre-animation state.
    // Once animations begin, the coordinates will be defined anyway.
    // This also ensures the lines aren't visible before they're ready to be animated.
    const axis = this._svgShapeFactory.getLine(...points);
    axis.stroke();

    if (addArrowHead) {
      axis.addArrowHead();
    }

    this.addSVGChildElement(axis.node);
    return axis;
  }

  animateAxisDrawing(axis, coords, duration, onDone = () => {}) {
    const [from, to] = coords;
    this.animateAxis(axis, [from, from], [from, to], duration, onDone);
  }

  animateAxis(axis, fromCoords, toCoords, animationDuration, onDone = () => {}) {
    const pointToValue = ({ x, y }) => `${x},${y}`;
    const from = fromCoords.map(pointToValue).join(" ");
    const to = toCoords.map(pointToValue).join(" ");
    // eslint-disable-next-line no-useless-escape
    const id = `axis-animation-${(from + to).replace(/[,\.\s]/g, "")}`;

    axis.animateAttribute("points", {
      from,
      to,
      id,
      dur: animationDuration.s,
      fill: "freeze",
      begin: "indefinite",
      calcMode: "spline",
      keyTimes: "0; 1",
      keySplines: BezierEasing.easeOutSine.smilString
    });

    // Add the arrowheads slightly after the beginning of each animation
    // because otherwise the first thing we see is an arrowhead not attached to a line.
    this._timerManager.setTimeout(() => {
      axis.addArrowHead();
    }, animationDuration.ms / 25);

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
      label = this._svgShapeFactory.getTypingText(text, coords, 1);
      this.addSVGChildElement(label.node);
      label.animateTyping(null, onDone);
    } else {
      label = this._svgShapeFactory.getText(text, coords);
      this.addSVGChildElement(label.node);
    }

    return label;
  }

  drawSpiral() {
    const spiral = this._svgShapeFactory.getPath("M210,215 \
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
