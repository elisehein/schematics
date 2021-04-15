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

    const cubeFaceSize = 180;
    this._skewAmount = cubeFaceSize / 2;
  }

  draw() {
    super.draw();
    this.drawSinglePathCubeWithAnimation();
  }

  drawSinglePathCubeWithAnimation() {
    const cube = new Path(this.getInitialCubePath());
    cube.node.innerHTML = this.getAnimationNode();
    this.addSVGChildElement(cube.node);
  }

  getInitialCubePath() {
    const { A, B, C, D, E, F, G, H } = this._baseCoords;

    return `
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
  }

  getMirroredCubePath() {
    const { A, B, C, D, E, F, G, H } = this._baseCoords;

    return `
    M${A.x - this._skewAmount},${A.y}
    L${B.x - this._skewAmount},${B.y}
    L${D.x + this._skewAmount},${D.y}
    L${C.x + this._skewAmount},${C.y}
    L${A.x - this._skewAmount},${A.y}
    L${E.x - this._skewAmount},${E.y}
    L${F.x - this._skewAmount},${F.y}
    L${H.x + this._skewAmount},${H.y}
    L${G.x + this._skewAmount},${G.y}
    L${E.x - this._skewAmount},${E.y}
    M${C.x + this._skewAmount},${C.y}
    L${G.x + this._skewAmount},${G.y}
    M${D.x + this._skewAmount},${D.y}
    L${H.x + this._skewAmount},${H.y}
    M${B.x - this._skewAmount},${B.y}
    L${F.x - this._skewAmount},${F.y}
    Z
    `;
  }

  getAnimationNode() {
    const cubicBezier = `.3 0 .7 1`;

    return `
    <animate
      attributeName="d"
      values="${this.getInitialCubePath()};${this.getMirroredCubePath()};${this.getInitialCubePath()}"
      keyTimes="0;0.5;1"
      calcMode="spline"
      keySplines="${cubicBezier}; ${cubicBezier}"
      dur="10s"
      begin="0s"
      repeatCount="indefinite"
      fill="freeze" />
    `;
  }
}

customElements.define("figure-43", Figure43);