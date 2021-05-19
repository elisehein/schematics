/* eslint-disable id-length */
import Diagram from "./Diagram.js";
import { Line, Path, TypingText } from "../SVGShapes/SVGShapes.js";

export default class Figure14Diagram extends Diagram {
  constructor() {
    super(14);
  }

  drawBeforeCaption({ onDone }) {
    this.drawAxes(onDone)
  }

  drawAlongsideCaption() {
    super.drawAlongsideCaption();

    setTimeout(() => {
      this.drawSpiral();
    }, 1000);
  }

  drawAxes(onAllDone) {
    runEachActionWhenPreviousDone([
      this.drawAxis.bind(this, { x: 149, y: 220 }, { x: 149, y: 30 }, 3),
      waitBeforeNextAction(500),
      this.drawAxis.bind(this, { x: 149, y: 220 }, { x: 250, y: 205 }, 1),
      this.drawLabel.bind(this, "X", { x: 257, y: 207 }),
      this.drawAxis.bind(this, { x: 149, y: 220 }, { x: 200, y: 260 }, 1.5),
      this.drawLabel.bind(this, "Y", { x: 207, y: 262 }),
      this.drawLabel.bind(this, "Time", { x: 157, y: 36 }),
      waitBeforeNextAction(1000)
    ], onAllDone);
  }

  drawAxis(startCoords, endCoords, durationSeconds, { onDone }) {
    const axis = new Line(startCoords, startCoords);
    axis.animateAttribute("points", {
      from: `${startCoords.x},${startCoords.y} ${startCoords.x},${startCoords.y}`,
      to: `${startCoords.x},${startCoords.y} ${endCoords.x},${endCoords.y}`,
      dur: durationSeconds,
      keyTimes: "0; 1",
      calcMode: "spline",
      keySplines: "0.33 1 0.68 1",
      fill: "freeze"
    });
    axis.stroke();
    this.addSVGChildElement(axis.node);

    axis.beginAnimation(null, () => {
      axis.addArrowHead(this.registerMarker.bind(this));
      onDone();
    });
  }

  drawLabel(text, coords, { onDone }) {
    const label = new TypingText(text, coords, 2);
    this.addSVGChildElement(label.node);
    label.animateTyping(null, onDone);
  }

  drawSpiral() {
    const spiral = new Path("M210,215 \
                             C 210,175, 90,175, 90,195 \
                             C 90,215, 210,215, 210,175 \
                             C 210,135, 90,135, 90,155 \
                             C 90,175, 210,175, 210,135 \
                             C 210,95, 90,95, 90,115 \
                             C 90,135, 210,135, 210,95");
    spiral.stroke(2);

    spiral.animateStroke("16s", "linear");
    this.addSVGChildElement(spiral.node);
  }
}

customElements.define("figure-14-diagram", Figure14Diagram);

// Each orderedAction must be a function that takes { onDone }
function runEachActionWhenPreviousDone(orderedActions, onAllDone) {
  const runActions = index => {
    const nextIndex = index + 1;
    const onActionDone = nextIndex >= orderedActions.length ? onAllDone : runActions.bind(this, nextIndex);
    orderedActions[index]({ onDone: onActionDone });
  }

  runActions(0);
}

function waitBeforeNextAction(delay) {
  return ({ onDone }) => setTimeout(onDone, delay);
};
