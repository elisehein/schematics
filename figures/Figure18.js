import Figure from "./Figure.js";
import { Line, BoxedText} from "./SVGShape.js";

export default class Figure18 extends Figure {
  constructor(figureNode, a11yDescription, poetry) {
    super(figureNode, 18, a11yDescription, poetry);
  }

  draw() {
    super.draw();
    this.drawFirstBox();
  }

  drawFirstBox() {
    this.drawBoxedText("good?", { x: 25, y: 45 });
    this.drawBoxedText("more?", { x: 125, y: 45 });
    this.drawBoxedText("do it.", { x: 225, y: 45 });
    this.drawBoxedText("fix it?", { x: 25, y: 105 });
    this.drawBoxedText("stopit.", { x: 25, y: 165 });
    this.drawBoxedText("good.", { x: 25, y: 225 });
  }

  drawBoxedText(text, coords) {
    const boxSize = { width: 50, height: 30 };
    const fontSize = 8;

    const boxedText = new BoxedText(text, fontSize, coords, boxSize);
    boxedText.node.setAttribute("class", "boxed-text");
    this._canvas.appendChild(boxedText.node);
  }
}