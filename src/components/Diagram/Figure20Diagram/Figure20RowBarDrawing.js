const originalWavePatternData = {
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

export default class RowBarDrawing {
  constructor(svgHeight, svgShapeFactory, wavePatternData = originalWavePatternData) {
    this._svgHeight = svgHeight;
    this._svgShapeFactory = svgShapeFactory;
    this._wavePatternData = wavePatternData;

    this._rowYs = this.precalculateRowYs();
  }

  get numberOfRows() {
    return this._wavePatternData.numberOfRows;
  }

  get rowsHeight() {
    return this._svgHeight - (2 * this._wavePatternData.verticalInset);
  }

  get numberOfGaps() {
    return this._wavePatternData.numberOfRows - 1;
  }

  get rowGap() {
    const { numberOfRows, rowToGapRatio } = this._wavePatternData;
    return this.rowsHeight / (numberOfRows * rowToGapRatio + this.numberOfGaps);
  }

  get singleRowHeight() {
    return this.rowGap * this._wavePatternData.rowToGapRatio;
  }

  get barGap() {
    return this._wavePatternData.barGap;
  }

  get barsPerRow() {
    return this._wavePatternData.barsPerRow;
  }

  precalculateRowYs() {
    const rowYs = [];
    const { numberOfRows, verticalInset } = this._wavePatternData;

    for (let rowIndex = 0; rowIndex < numberOfRows; rowIndex += 1) {
      const topY = verticalInset + (rowIndex * (this.singleRowHeight + this.rowGap));
      const bottomY = topY + this.singleRowHeight;
      rowYs.push({ top: topY, bottom: bottomY });
    }

    return rowYs;
  }

  drawBars(barXGetter) {
    const bars = [];
    const groupNodes = [];
    const { barsPerRow, numberOfRows } = this._wavePatternData;

    for (let rowIndex = 0; rowIndex < numberOfRows; rowIndex += 1) {
      const barsForRow = [];
      const groupNode = this._svgShapeFactory.getGroupNode();
      groupNode.dataset.rowIndex = rowIndex;
      const { top: topY, bottom: bottomY } = this._rowYs[rowIndex];

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

  drawBar(topY, bottomY, x) {
    const lineTopPoint = { x, y: topY };
    const lineBottomPoint = { x, y: bottomY };
    const bar = this._svgShapeFactory.getLine(lineTopPoint, lineBottomPoint);
    bar.stroke();
    bar.node.style.strokeLinecap = "unset";
    return bar;
  }

  getRowAt(y) {
    return this._rowYs.findIndex(({ top, bottom }) => y >= top && y <= bottom);
  }

}

export const originalPeaksPerRow = originalWavePatternData.peaksPerRow;
