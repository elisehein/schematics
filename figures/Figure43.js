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
    this.drawSinglePathCubeWithAnimation();
  }

  drawSinglePathCubeWithAnimation() {
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

    rhombus.node.innerHTML = `
    <animate
      attributeName="d"
      values="${pathDef};${skewedPathDef};${pathDef}"
      keyTimes="0;0.5;1"
      calcMode="spline"
      keySplines="0.42 0 0.58 1; 0.42 0 0.58 1"
      dur="10s"
      begin="0s"
      repeatCount="indefinite"
      fill="freeze" />
    `;

    this.addSVGChildElement(rhombus.node);
  }
}

customElements.define("figure-43", Figure43);