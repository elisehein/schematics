import { SVGDiagram } from "./Diagram.js";
import BezierEasing from "../../helpers/BezierEasing.js";
import Duration from "../../helpers/Duration.js";

export default class Figure20Diagram extends SVGDiagram {
  constructor(...args) {
    super(20, ...args);

    this._numberOfRows = 7;
    this._barSpacing = 7;
    this._verticalInset = 30;

    this._rowHeight = (
      300 -
      (2 * this._verticalInset)
    ) / (this._numberOfRows * 2 - 1);
    this._rowSpacing = this._rowHeight;
  }

  drawThumbnail() {
  }

  drawBeforeCaption({ onDone }) {
    // onDone();
    this._bars = this.drawBars();
  }

  drawAfterCaption({ onLightUp }) {
  }

  drawBars() {
    const bars = [];

    for (let rowIndex = 0; rowIndex < this._numberOfRows; rowIndex += 1) {
      const barsForRow = [];
      const groupNode = this._svgShapeFactory.getGroupNode();
      groupNode.dataset.rowIndex = rowIndex;

      const topY = this._verticalInset + (rowIndex * (this._rowHeight + this._rowSpacing));
      const bottomY = topY + this._rowHeight;

      for (let barIndex = 0; barIndex < 100; barIndex += 1) {
        const bar = this.drawBar(topY, bottomY, barIndex);
        groupNode.appendChild(bar.node);
        barsForRow.push(bar);
      }

      this.addSVGChildElement(groupNode);
      bars.push(barsForRow);
    }

    return bars;
  }

  drawBar(topY, bottomY, barIndex) {
    const x = 299 - (barIndex * this._barSpacing);
    const lineTopPoint = { x, y: topY };
    const lineBottomPoint = { x, y: bottomY };
    const bar = this._svgShapeFactory.getLine(lineTopPoint, lineBottomPoint);
    bar.stroke();
    bar.node.style.strokeLinecap = "unset";
    return bar;
  }
}

customElements.define("figure-20-diagram", Figure20Diagram);
