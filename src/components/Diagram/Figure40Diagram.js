import { createSVGElement } from "../../../components/SVGShapes/SVGShapes.js";
import Diagram from "./Diagram.js";

export default class Figure40Diagram extends Diagram {
  constructor(isThumbnail) {
    super(40, isThumbnail);

    this._starsAlongYAxes = {};
  }

  // eslint-disable-next-line max-statements
  drawBeforeCaption({ onDone }) {
    this.drawStarsAlongYAxis(15, 29, 50, 63, 67);
    this.drawStarsAlongYAxis(28, 70);
    this.drawStarsAlongYAxis(42, 63, 67);
    this.drawStarsAlongYAxis(53, 53);
    this.drawStarsAlongYAxis(56, 60, 74, 78);
    this.drawStarsAlongYAxis(66, 57, 74, 78, 90, 94, 105, 133, 222);
    this.drawStarsAlongYAxis(70, 74);
    this.drawStarsAlongYAxis(73, 98, 102, 108);
    this.drawStarsAlongYAxis(77, 105);
    this.drawStarsAlongYAxis(84, 98, 112, 136);
    this.drawStarsAlongYAxis(122, 77, 88, 108, 112);
    this.drawStarsAlongYAxis(132, 132, 143, 153);
    this.drawStarsAlongYAxis(149, 98, 112, 116, 122, 126, 132, 136, 140, 143, 149, 153);
    this.drawStarsAlongYAxis(155, 64);
    this.drawStarsAlongYAxis(162, 77, 81, 88, 112, 116, 119, 136, 143, 146, 150, 157, 163);
    this.drawStarsAlongYAxis(173, 132, 163, 167);
    this.drawStarsAlongYAxis(176, 115, 122, 125, 129, 132, 136, 143, 146, 150, 153, 156, 163, 167, 170, 184, 191, 194);
    this.drawStarsAlongYAxis(180, 129, 150, 167);
    this.drawStarsAlongYAxis(204, 115, 119, 132, 139, 143, 149, 153, 157, 160, 167, 170, 174, 180, 187);
    this.drawStarsAlongYAxis(231, 63, 77, 81, 101, 108, 115, 139, 146, 153, 157, 160, 164, 167, 170, 174, 177, 181, 184, 191, 215, 219);
    this.drawStarsAlongYAxis(235, 77, 153, 157, 164, 170, 177, 181);
    this.drawStarsAlongYAxis(242, 191, 197, 201, 229, 239);
    this.drawStarsAlongYAxis(259, 77, 87, 98, 153, 160, 163, 167, 171, 173, 188, 195, 202, 205, 218, 229, 242, 256);
    this.drawStarsAlongYAxis(269, 56);
    this.drawStarsAlongYAxis(286, 46, 53, 191, 194, 205, 211, 215, 218, 222, 263);
  }

  drawThumbnail() {
  }

  drawStarsAlongYAxis(x, ...yCoords) {
    this._starsAlongYAxes.x = yCoords.map(y => this.drawStar(x, y));
  }

  drawStar(x, y) {
    const g = createSVGElement("g");
    const width = 2;
    const height = 3;

    const horizontalLine = this._svgShapeFactory.getLine({ x: x - (width / 2), y }, { x: x + (width / 2), y });
    horizontalLine.stroke(2);
    horizontalLine.node.style.strokeLinecap = "square";

    const verticalLine = this._svgShapeFactory.getLine({ x, y: y - (height / 2) }, { x, y: y + (height / 2) });
    verticalLine.stroke(2);
    verticalLine.node.style.strokeLinecap = "square";

    g.appendChild(horizontalLine.node);
    g.appendChild(verticalLine.node);
    this.addSVGChildElement(g);
    return g;
  }
}

customElements.define("figure-40-diagram", Figure40Diagram);
