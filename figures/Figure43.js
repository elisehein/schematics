import Figure from "./Figure.js";
import { Line } from "./SVGShape.js";

export default class Figure43 extends Figure {
  /*
   *          A--------B
   *     C----|---D    |
   *     |    |   |    |
   *     |    E---|----F
   *     G--------H
   */
  constructor() {
    super(43);

    this._baseCoords = {
      A: { x: 105, y: 37.5 },
      B: { x: 285, y: 37.5 },
      C: { x: 15, y: 82.5 },
      D: { x: 195, y: 82.5 },
      E: { x: 105, y: 217.5 },
      F: { x: 285, y: 217.5 },
      G: { x: 15, y: 262.5 },
      H: { x: 195, y: 262.5 },
    }
  }

  draw() {
    super.draw();
    this.drawCube();
  }

  drawCube() {
    this.drawLines([
      { from: "A", to: "B" },
      { from: "C", to: "D" },
      { from: "E", to: "F" },
      { from: "G", to: "H" },
      { from: "A", to: "C" },
      { from: "B", to: "D" },
      { from: "E", to: "G" },
      { from: "F", to: "H" },
      { from: "A", to: "E" },
      { from: "B", to: "F" },
      { from: "C", to: "G" },
      { from: "D", to: "H" }
    ]);
  }

  drawLines(lineDefs) {
    lineDefs.forEach(this.drawLine.bind(this));
  }

  drawLine(lineDef) {
    const line = new Line(this._baseCoords[lineDef.from], this._baseCoords[lineDef.to]);
    this.addSVGChildElement(line.node);
  }
}

customElements.define("figure-43", Figure43);