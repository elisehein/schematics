import Figure from "./Figure.js";
import { Path, createSVGElement } from "./SVGShape.js";

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
      { from: "A", to: "B", className: "line--moving-left" },
      { from: "C", to: "D", className: "line--moving-right" },
      { from: "E", to: "F", className: "line--moving-left" },
      { from: "G", to: "H", className: "line--moving-right" },
      { from: "A", to: "C", className: "line--rotating" },
      { from: "B", to: "D", className: "line--rotating" },
      { from: "E", to: "G", className: "line--rotating" },
      { from: "F", to: "H", className: "line--rotating" },
      { from: "A", to: "E", className: "line--moving-left" },
      { from: "B", to: "F", className: "line--moving-left" },
      { from: "C", to: "G", className: "line--moving-right" },
      { from: "D", to: "H", className: "line--moving-right" }
    ]);
  }

  drawLines(lineDefs) {
    lineDefs.forEach(this.drawLine.bind(this));
  }

  drawLine(lineDef) {
    // const line = new Line(this._baseCoords[lineDef.from], this._baseCoords[lineDef.to]);
    const id = `line-${lineDef.from}${lineDef.to}`;
    const from = this._baseCoords[lineDef.from];
    const to = this._baseCoords[lineDef.to];

    const line = new Path(`M${from.x},${from.y}L${to.x},${to.y}`);
    line.node.classList.add(lineDef.className);
    line.node.setAttribute("id", id);

    // const animate = createSVGElement("animate");
    // line.node.innerHTML = `
    // <animate attributeName="d" from="M50,100L100,100L150,100" to="M50,100L100,150L150,100" dur="2s" begin="mycross.click" fill="freeze" />
    // `;

    this.addSVGChildElement(line.node);
  }
}

customElements.define("figure-43", Figure43);