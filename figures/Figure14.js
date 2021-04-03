import Figure from "./Figure.js";
import { Line, Path, Text } from "./SVGShape.js";

export default class Figure14 extends Figure {
  constructor() {
    super(14);
  }

  draw() {
    super.draw();
    this.drawAxes()
  }

  animate() {
    super.animate();
    this.drawSpiral();
  }

  drawAxes() {
    this.drawAxisWithLabel({x: 149, y: 220}, {x: 149, y: 30}, {x: 157, y: 36}, "Time");
    this.drawAxisWithLabel({x: 149, y: 220}, {x: 250, y: 205}, {x: 257, y: 207}, "X");
    this.drawAxisWithLabel({x: 149, y: 220}, {x: 200, y: 260}, {x: 207, y: 262}, "Y");
  }

  drawAxisWithLabel(startCoords, endCoords, labelCoords, labelText) {
    const axis = new Line(startCoords, endCoords, "arrowhead-marker");
    const label = new Text(labelText, labelCoords);
    this.addSVGChildElement(axis.node);
    this.addSVGChildElement(label.node);
  }

  drawSpiral() {
    const spiral = new Path("M210,215 \
                             C 210,175, 90,175, 90,195 \
                             C 90,215, 210,215, 210,175 \
                             C 210,135, 90,135, 90,155 \
                             C 90,175, 210,175, 210,135 \
                             C 210,95, 90,95, 90,115 \
                             C 90,135, 210,135, 210,95");

    this.style.setProperty("--animatable-line-length", spiral.length);

    const node = spiral.node;
    node.classList.add("spiral");
    this.addSVGChildElement(node);
  }
}

customElements.define("figure-14", Figure14);