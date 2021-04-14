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

    this._cubeFaceSize = 180;
  }

  draw() {
    super.draw();
    // this.drawCube();
    this.drawSinglePathCube();
  }

  drawSinglePathCube() {
    const { A, B, C, D, E, F, G, H } = this._baseCoords;

    const pathDef = `
    M${A.x},${A.y}
    L${B.x},${B.y}
    L${D.x},${D.y}
    L${C.x},${C.y}
    L${A.x},${A.y}
    L${E.x},${E.y}
    L${F.x},${F.y}
    L${H.x},${H.y}
    L${G.x},${G.y}
    L${E.x},${E.y}
    M${C.x},${C.y}
    L${G.x},${G.y}
    M${D.x},${D.y}
    L${H.x},${H.y}
    M${B.x},${B.y}
    L${F.x},${F.y}
    Z
    `;

    const skewAmount = this._cubeFaceSize / 2;
    const skewedPathDef = `
    M${A.x - skewAmount},${A.y}
    L${B.x - skewAmount},${B.y}
    L${D.x + skewAmount},${D.y}
    L${C.x + skewAmount},${C.y}
    L${A.x - skewAmount},${A.y}
    L${E.x - skewAmount},${E.y}
    L${F.x - skewAmount},${F.y}
    L${H.x + skewAmount},${H.y}
    L${G.x + skewAmount},${G.y}
    L${E.x - skewAmount},${E.y}
    M${C.x + skewAmount},${C.y}
    L${G.x + skewAmount},${G.y}
    M${D.x + skewAmount},${D.y}
    L${H.x + skewAmount},${H.y}
    M${B.x - skewAmount},${B.y}
    L${F.x - skewAmount},${F.y}
    Z
    `;

    const rhombus = new Path(pathDef);
    // const id = `rhombus-${rhombusDef}`;
    // rhombus.node.setAttribute("id", id);

    rhombus.node.innerHTML = `
    <animate
      attributeName="d"
      values="${pathDef};${skewedPathDef};${pathDef}"
      dur="10s"
      begin="0s"
      repeatCount="indefinite"
      fill="freeze" />
    `;

    this.addSVGChildElement(rhombus.node);
  }

  drawCube() {
    this.drawLines([
      { from: "A", to: "E", className: "line--moving-left" },
      { from: "B", to: "F", className: "line--moving-left" },
      { from: "C", to: "G", className: "line--moving-right" },
      { from: "D", to: "H", className: "line--moving-right" }
    ]);

    this.drawSkewingRhombi([
      "ABDC",
      "EFHG"
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

  drawSkewingRhombi(rhombusDefs) {
    rhombusDefs.forEach(this.drawRhombus.bind(this));
  }

  drawRhombus(rhombusDef) {
    const pointsInOrder = rhombusDef.split("").map(point => this._baseCoords[point]);

    const pathDef = `
    M${pointsInOrder[0].x},${pointsInOrder[0].y}
    L${pointsInOrder[1].x},${pointsInOrder[1].y}
    M${pointsInOrder[2].x},${pointsInOrder[2].y}
    L${pointsInOrder[3].x},${pointsInOrder[3].y}
    Z
    `;

    const skewAmount = this._cubeFaceSize / 2;
    const skewedPathDef = `
    M${pointsInOrder[0].x - skewAmount},${pointsInOrder[0].y}
    L${pointsInOrder[1].x - skewAmount},${pointsInOrder[1].y}
    M${pointsInOrder[2].x + skewAmount},${pointsInOrder[2].y}
    L${pointsInOrder[3].x + skewAmount},${pointsInOrder[3].y}
    Z
    `;

    const rhombus = new Path(pathDef);
    const id = `rhombus-${rhombusDef}`;
    rhombus.node.setAttribute("id", id);

    rhombus.node.innerHTML = `
    <animate
      attributeName="d"
      values="${pathDef};${skewedPathDef};${pathDef}"
      dur="10s"
      begin="0s"
      repeatCount="indefinite"
      fill="freeze" />
    `;

    this.addSVGChildElement(rhombus.node);
  }
}

customElements.define("figure-43", Figure43);