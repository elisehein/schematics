import BezierEasing from "/helpers/BezierEasing.js";

const originalDrawingData = {
  peaksPerRow: [
    [0],
    [40],
    [0, 70],
    [40, 125],
    [0, 85, 170],
    [40, 125, 210],
    [0, 85, 170, 255]
  ],
  numberOfRows: 7,
  barGap: 10,
  barsPerRow: 90,
  verticalInset: 15,
  rowToGapRatio: 0.8
};

const thumbnailRowData = {
  peaksPerRow: [[150]],
  numberOfRows: 1,
  barGap: 25,
  barsPerRow: 30,
  verticalInset: 130,
  rowToGapRatio: 0.8
};

export default class RowBarDrawing {
  constructor(svgHeight, svgShapeFactory, isThumbnail = false) {
    this._svgHeight = svgHeight;
    this._svgShapeFactory = svgShapeFactory;
    this._drawingData = isThumbnail ? thumbnailRowData : originalDrawingData;

    this._rowYs = this.precalculateRowYs();
  }

  get numberOfRows() {
    return this._drawingData.numberOfRows;
  }

  get rowsHeight() {
    return this._svgHeight - (2 * this._drawingData.verticalInset);
  }

  get numberOfGaps() {
    return this._drawingData.numberOfRows - 1;
  }

  get rowGap() {
    const { numberOfRows, rowToGapRatio } = this._drawingData;
    return this.rowsHeight / (numberOfRows * rowToGapRatio + this.numberOfGaps);
  }

  get singleRowHeight() {
    return this.rowGap * this._drawingData.rowToGapRatio;
  }

  get barGap() {
    return this._drawingData.barGap;
  }

  get barsPerRow() {
    return this._drawingData.barsPerRow;
  }

  precalculateRowYs() {
    const rowYs = [];
    const { numberOfRows, verticalInset } = this._drawingData;

    for (let rowIndex = 0; rowIndex < numberOfRows; rowIndex += 1) {
      const topY = verticalInset + (rowIndex * (this.singleRowHeight + this.rowGap));
      const bottomY = topY + this.singleRowHeight;
      rowYs.push({ top: topY, bottom: bottomY });
    }

    return rowYs;
  }

  drawBars(barXGetter, initiallyScaledDown) {
    const bars = [];
    const groupNodes = [];
    const { barsPerRow, numberOfRows } = this._drawingData;

    for (let rowIndex = 0; rowIndex < numberOfRows; rowIndex += 1) {
      const barsForRow = [];
      const { top: topY, bottom: bottomY } = this._rowYs[rowIndex];
      const groupNode = this.getRowGroupNode(initiallyScaledDown);

      for (let barIndex = 0; barIndex < barsPerRow; barIndex += 1) {
        const bar = this.drawBar(topY, bottomY, barXGetter(barIndex));
        groupNode.appendChild(bar.node);
        barsForRow.push(bar);
      }

      groupNodes.push(groupNode);
      bars.push(barsForRow);
    }

    return { bars, groupNodes };
  }

  getRowGroupNode(initiallyScaledDown) {
    const groupNode = this._svgShapeFactory.getGroupNode();
    groupNode.style.transformOrigin = "center center";
    groupNode.style.transformBox = "fill-box";

    if (initiallyScaledDown) {
      groupNode.style.transform = "scaleY(0)";
    }

    return groupNode;
  }

  drawBar(topY, bottomY, x) {
    const lineTopPoint = { x, y: topY };
    const lineBottomPoint = { x, y: bottomY };
    const bar = this._svgShapeFactory.getLine(lineTopPoint, lineBottomPoint);
    bar.node.dataset.x = x; // For easy access later
    bar.stroke();
    bar.node.style.strokeLinecap = "unset";
    return bar;
  }

  animateRowAppearances(groupNodes, timerManager, onDone) {
    const duration = (2).seconds();
    groupNodes.forEach(node => {
      node.style.transition = `transform ${duration.s}s ${BezierEasing.easeInCubic.cssString}`;
    });

    groupNodes[0].addEventListener("transitionend", onDone, { once: true });

    // The new transform needs to be set asynchronously for the transition to work on Safari
    timerManager.setTimeout(() => {
      groupNodes.forEach(node => {
        node.style.transform = "scaleY(1)";
      });
    });
  }

  getRowAt(y) {
    return this._rowYs.findIndex(({ top, bottom }) => y >= top && y <= bottom);
  }

  positionIsInInsets(y) {
    return (
      y < this._drawingData.verticalInset ||
      y > this._svgHeight - this._drawingData.verticalInset
    );
  }

  get peaksPerRow() {
    return this._drawingData.peaksPerRow;
  }

}
