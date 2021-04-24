import Figure from "./Figure.js";
import { Line } from "./SVGShape.js";

export default class Figure36 extends Figure {
  constructor() {
    super(36);
  }

  draw() {
    super.draw();
    this.drawPendulum();
  }

  drawPendulum() {
    const pendulum = new Line(
      { x: 30, y: 240 },
      { x: 150, y: 60 },
      { x: 270, y: 240 }
    );

    this.addSVGChildElement(pendulum.node);
  }
}

customElements.define("figure-36", Figure36);