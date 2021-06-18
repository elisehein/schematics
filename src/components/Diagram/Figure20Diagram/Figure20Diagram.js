import { SVGDiagram } from "../Diagram.js";
import WaveCoordinates from "./Figure20WaveCoordinates.js";

import BezierEasing from "/helpers/BezierEasing.js";
import Duration from "/helpers/Duration.js";
import animateWithEasing from "/helpers/animateWithEasing.js";

export default class Figure20Diagram extends SVGDiagram {
  constructor(...args) {
    super(20, ...args);

    this._numberOfRows = 7;
    this._numberOfGaps = this._numberOfRows - 1;
    const barGap = 10;
    this._barsPerRow = 200;
    this._verticalInset = 15;
    this._waveWidth = 70;

    const rowToRowGapRatio = 0.8;
    const height = 300 - (2 * this._verticalInset);
    this._rowGap =  height / (this._numberOfRows * rowToRowGapRatio + this._numberOfGaps);
    this._rowHeight = this._rowGap * rowToRowGapRatio;

    this._coords = new WaveCoordinates(1.2, barGap, this._barsPerRow, this.svgSize);
  }

  drawThumbnail() {
  }

  drawBeforeCaption({ onDone }) {
    this._bars = this.drawBars();

    this.addWaves({ peaks: [0], rowBars: this._bars[0] });
    this.addWaves({ peaks: [40], rowBars: this._bars[1] });
    this.addWaves({ peaks: [0, 70], rowBars: this._bars[2] });
    this.addWaves({ peaks: [40, 125], rowBars: this._bars[3] });
    this.addWaves({ peaks: [0, 85, 170], rowBars: this._bars[4] });
    this.addWaves({ peaks: [40, 125, 210], rowBars: this._bars[5] });
    this.addWaves({ peaks: [0, 85, 170, 255], rowBars: this._bars[6] });

    // this.animateWaves([0, 70], this._bars[2]);

    // onDone();
  }

  drawAfterCaption() {
  }

  drawBars() {
    const bars = [];

    for (let rowIndex = 0; rowIndex < this._numberOfRows; rowIndex += 1) {
      const barsForRow = [];
      const groupNode = this._svgShapeFactory.getGroupNode();
      groupNode.dataset.rowIndex = rowIndex;

      const topY = this._verticalInset + (rowIndex * (this._rowHeight + this._rowGap));
      const bottomY = topY + this._rowHeight;

      for (let barIndex = 0; barIndex < this._barsPerRow; barIndex += 1) {
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
    const x = this._coords.getInitialXForBar(barIndex);
    const lineTopPoint = { x, y: topY };
    const lineBottomPoint = { x, y: bottomY };
    const bar = this._svgShapeFactory.getLine(lineTopPoint, lineBottomPoint);
    bar.stroke();
    bar.node.style.strokeLinecap = "unset";
    return bar;
  }

  addWaves({ peaks, rowBars }) {
    const translatedXCoordinates = this._coords.getTranslationsForWaves(peaks);
    rowBars.forEach((bar, index) => {
      bar.node.setAttribute("transform", `translate(${translatedXCoordinates[index]} 0)`);
    });
  }

  animateWaves(initialPeaks, rowBars) {
    const totalTravelDistance = 350;
    const translationsForTravelDistance = this._coords
      .getTranslationsForTravellingWaves(initialPeaks, totalTravelDistance);

    const duration = new Duration({ seconds: 2 });

    animateWithEasing(duration, BezierEasing.linear, fractionOfAnimationDone => {
      // TODO: Round to one fraction and use memoization
      const travelledSoFar = Math.round(totalTravelDistance * fractionOfAnimationDone);
      const translationsIndex = Math.min(totalTravelDistance, travelledSoFar);
      const translations = translationsForTravelDistance[translationsIndex];

      rowBars.forEach((bar, index) => {
        bar.node.setAttribute("transform", `translate(${translations[index]} 0)`);
      });
    }, { onDone: () => {
      // TODO fix error
      // this.animateWaves(initialWaveCenters, rowBars);
    } });
  }
}

customElements.define("figure-20-diagram", Figure20Diagram);
