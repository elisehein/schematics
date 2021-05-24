import Diagram from "./Diagram.js";
import { Line, Path, TypingText, Text } from "../SVGShapes/SVGShapes.js";

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

  drawAxes(onAllDone) {
    this.drawAxis({ x: 149, y: 220 }, { x: 149, y: 30 });
    this.drawAxis({ x: 149, y: 220 }, { x: 250, y: 205 });
    this.drawAxis({ x: 149, y: 220 }, { x: 200, y: 260 });
    this.drawLabel("X", { x: 257, y: 207 });
    this.drawLabel("Y", { x: 207, y: 262 });
    this.drawLabel("Time", { x: 157, y: 36 });

    this._timerManager.setTimeout(onAllDone, 1000);
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
