/* eslint-disable id-length */
import Diagram from "./Diagram.js";
import { Line, Path, TypingText, Text } from "../SVGShapes/SVGShapes.js";

export default class Figure14Diagram extends Diagram {
  constructor() {
    super(14);
  }

  drawBeforeCaption({ onDone }) {
    this.drawAxes(onDone)
  }

  drawAlongsideCaption() {
    super.drawAlongsideCaption();
    this.drawSpiral();
  }

  drawAxes(onAllDone) {
    this.drawAxis({ x: 149, y: 220 }, { x: 149, y: 30 });
    this.drawAxis({ x: 149, y: 220 }, { x: 250, y: 205 });
    this.drawAxis({ x: 149, y: 220 }, { x: 200, y: 260 });
    this.drawLabel("X", { x: 257, y: 207 }, false);
    this.drawLabel("Y", { x: 207, y: 262 }, false);

    runEachActionWhenPreviousDone([
      waitBeforeNextAction(1000),
      this.drawLabel.bind(this, "Time", { x: 157, y: 36 }, true),
      waitBeforeNextAction(1000)
    ], onAllDone);
  }

  drawAxis(startCoords, endCoords) {
    const axis = new Line(startCoords, endCoords);
    axis.stroke();
    axis.addArrowHead(this.registerMarker.bind(this));
    this.addSVGChildElement(axis.node);
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

  drawSpiral() {
    const spiral = new Path("M210,215 \
                             C 210,175, 90,175, 90,195 \
                             C 90,215, 210,215, 210,175 \
                             C 210,135, 90,135, 90,155 \
                             C 90,175, 210,175, 210,135 \
                             C 210,95, 90,95, 90,115 \
                             C 90,135, 210,135, 210,95");
    spiral.stroke(2);
    // spiral.animateStroke("16s", "linear");
    this.addSVGChildElement(spiral.node);
    this.animateSpiralInSteps(spiral.node);
  }

  animateSpiralInSteps(spiralNode) {
    const spiralLength = spiralNode.getTotalLength();
    const sixthOfLength = spiralLength / 6.0;

    spiralNode.style.strokeDasharray = spiralLength;
    spiralNode.style.strokeDashoffset = spiralLength;

    // Update the style asynchronously so the transition isn't applied to the initial styles
    setTimeout(() => {
      spiralNode.style.transition = "stroke-dashoffset 2.6s cubic-bezier(0.65, 0, 0.35, 1)";
      spiralNode.style.strokeDashoffset = spiralLength - sixthOfLength;
    }, 1700);

    runEachActionWhenPreviousDone([
      this.transitionSpiral.bind(this, spiralNode, spiralLength - (3 * sixthOfLength), 4600, 1400),
      this.transitionSpiral.bind(this, spiralNode, spiralLength - (4 * sixthOfLength), 2600, 2400),
      this.transitionSpiral.bind(this, spiralNode, spiralLength - (6 * sixthOfLength), 4600, 3400)
    ], () => {});
  }

  transitionSpiral(spiralNode, strokeDashoffset, duration, delay, { onDone }) {
    spiralNode.addEventListener("transitionend", () => {
      setTimeout(() => {
        spiralNode.style.transitionDuration = `${duration}ms`;
        spiralNode.style.strokeDashoffset = strokeDashoffset;
        onDone();
      }, delay);
    }, { once: true });
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
