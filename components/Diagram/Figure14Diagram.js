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
    this.drawSpiral();
  }

  drawAxes(onDone) {
    this.drawAxis({ x: 149, y: 220 }, { x: 149, y: 30 }, 3, { onDone: () => {
      setTimeout(() => {
        this.drawAxis({ x: 149, y: 220 }, { x: 250, y: 205 }, 1, { onDone: () => {
          this.drawAxis({ x: 149, y: 220 }, { x: 200, y: 260 }, 1.5, { onDone: () => {

            this.drawLabel("Time", { x: 157, y: 36 }, { onDone: () => {
              this.drawLabel("X", { x: 257, y: 207 }, { onDone: () => {
                this.drawLabel("Y", { x: 207, y: 262 }, { onDone: () => {
                  setTimeout(onDone, 1000);
                }})
              }});
            }});
          }});
        }});
      }, 500);
    }});
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
