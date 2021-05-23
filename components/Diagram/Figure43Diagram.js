import Diagram from "./Diagram.js";
import { Path } from "../SVGShapes/SVGShapes.js";

export default class Figure43Diagram extends Diagram {

  /*
   *          A-------B   A-------B   A-------B
   *     C----|--D    |   C-------D   |   C---|---D
   *     |    |  |    | → |       | → |   |   |   |
   *     |    E--|----F   E       F   E---|---F   |
   *     G-------H        G-------H       G-------H
   *
   *       leftward        middle       rightward
   */
  constructor() {
    super(43);

    this._leftwardCoords = {
      A: { x: 150, y: 37.5 },
      B: { x: 290, y: 37.5 },
      C: { x: 10, y: 82.5 },
      D: { x: 150, y: 82.5 },
      E: { x: 150, y: 217.5 },
      F: { x: 290, y: 217.5 },
      G: { x: 10, y: 262.5 },
      H: { x: 150, y: 262.5 }
    };
  }

  drawAlongsideCaption() {
    super.drawAlongsideCaption();
    this.drawSinglePathCubeWithAnimation();
  }

  drawSinglePathCubeWithAnimation() {
    const cube = new Path(this.getLeftwardCubePath());
    cube.stroke();
    this.configureAnimation(cube);
    this.addSVGChildElement(cube.node);
  }

  getLeftwardCubePath() {
    const { A, B, C, D, E, F, G, H } = this._leftwardCoords;

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

  getRightwardCubePath() {
    const { A, B, C, D, E, F, G, H } = this._leftwardCoords;
    const skewAmount = 140;

    return `
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
  }

  getMiddleCubePath() {
    const { A, B, C, D, E, F, G, H } = this._leftwardCoords;

    return `
    M${A.x - 110},${A.y}
    L${B.x - 30},${B.y}
    L${D.x + 110},${D.y}
    L${C.x + 30},${C.y}
    L${A.x - 110},${A.y}
    L${E.x - 110},${E.y}
    L${F.x - 30},${F.y}
    L${H.x + 110},${H.y}
    L${G.x + 30},${G.y}
    L${E.x - 110},${E.y}
    M${C.x + 30},${C.y}
    L${G.x + 30},${G.y}
    M${D.x + 110},${D.y}
    L${H.x + 110},${H.y}
    M${B.x - 30},${B.y}
    L${F.x - 30},${F.y}
    Z
    `;
  }

  configureAnimation(cube) {
    const easeIn = ".12 0 .39 0";
    const easeOut = ".61 1 .88 1";

    cube.animateAttribute("d", {
      values: `
       ${this.getLeftwardCubePath()};
       ${this.getMiddleCubePath()};
       ${this.getRightwardCubePath()};
       ${this.getMiddleCubePath()};
       ${this.getLeftwardCubePath()}"
      `,
      keyTimes: "0; 0.25; 0.5; 0.75; 1",
      calcMode: "spline",
      keySplines: `${easeIn}; ${easeOut}; ${easeIn}; ${easeOut}`,
      dur: 15,
      begin: "0s",
      repeatCount: "indefinite",
      fill: "freeze"
    });
  }
}

customElements.define("figure-43-diagram", Figure43Diagram);
