import { SVGDiagram } from "../Diagram.js";
import WaveCoordinates from "./Figure20WaveCoordinates.js";

import BezierEasing from "/helpers/BezierEasing.js";
import { randomIntBetween } from "/helpers/random.js";
import Duration from "/helpers/Duration.js";
import animateWithEasing from "/helpers/animateWithEasing.js";

const originalWavePeaksPerRow = [
  [0],
  [40],
  [0, 70],
  [40, 125],
  [0, 85, 170],
  [40, 125, 210],
  [0, 85, 170, 255]
];

export default class Figure20Diagram extends SVGDiagram {
  // eslint-disable-next-line max-statements
  constructor(...args) {
    super(20, ...args);

    this._numberOfRows = 7;
    this._numberOfGaps = this._numberOfRows - 1;
    const barGap = 10;
    this._barsPerRow = 90;
    this._verticalInset = 15;
    this._waveWidth = 70;

    const rowToRowGapRatio = 0.8;
    const height = 300 - (2 * this._verticalInset);
    this._rowGap =  height / (this._numberOfRows * rowToRowGapRatio + this._numberOfGaps);
    this._rowHeight = this._rowGap * rowToRowGapRatio;
    this._rowYs = this.precalculateRowYs();

    this._rowsCurrentlyAnimating = [];
    this._peaksForRowWaveAnimations = this.precalculatePeaksForRowWaveAnimations();
    console.log(this._peaksForRowWaveAnimations);
    this._currentPeaksPerRow = originalWavePeaksPerRow;

    this._coords = new WaveCoordinates(1.2, barGap, this._barsPerRow, this.svgSize);
  }

  connectedCallback() {
    super.connectedCallback();
    this._svgReferencePoint = this.svgNode.createSVGPoint();
  }

  drawThumbnail() {
  }

  drawBeforeCaption({ onDone }) {
    this._bars = this.drawBars();
    this.animateWavesRandomly();
    // this.bindPointerEventsToWaveMovements();

    // onDone();
  }

  drawAfterCaption() {
  }

  precalculateRowYs() {
    const rowYs = [];

    for (let rowIndex = 0; rowIndex < this._numberOfRows; rowIndex += 1) {
      const topY = this._verticalInset + (rowIndex * (this._rowHeight + this._rowGap));
      const bottomY = topY + this._rowHeight;
      rowYs.push({ top: topY, bottom: bottomY });
    }

    return rowYs;
  }

  precalculatePeaksForRowWaveAnimations() {
    return originalWavePeaksPerRow.map(this.getPeaksForRowWaveAnimation.bind(this));
  }

  getPeaksForRowWaveAnimation(peaks) {
    const overflow = this.svgSize * 0.2;
    const initial = this.peaksAdjustedToEndAt(overflow * -1, peaks);
    const totalCoverage = peaks[peaks.length - 1] - peaks[0];
    const final = this.peaksAdjustedToEndAt(this.svgSize + overflow + totalCoverage, peaks);
    return { initial, final };
  }

  drawBars() {
    const bars = [];

    for (let rowIndex = 0; rowIndex < this._numberOfRows; rowIndex += 1) {
      const barsForRow = [];
      const groupNode = this._svgShapeFactory.getGroupNode();
      groupNode.dataset.rowIndex = rowIndex;
      const { top: topY, bottom: bottomY } = this._rowYs[rowIndex];

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

  setWavePeaks({ peaks, rowBars }) {
    const translatedXCoordinates = this._coords.getTranslationsForWaves(peaks);
    rowBars.forEach((bar, index) => {
      bar.node.setAttribute("transform", `translate(${translatedXCoordinates[index]} 0)`);
    });
  }

  animateWavesRandomly() {
    const randomDelay = new Duration({ milliseconds: randomIntBetween(100, 1000) });
    const randomDuration = new Duration({ milliseconds: randomIntBetween(2000, 4000) });
    const randomRow = randomIntBetween(0, this._numberOfRows - 1);

    this._waveAnimationTimer = this._timerManager.setTimeout(() => {
      const { initial, final } = this._peaksForRowWaveAnimations[randomRow];
      const travelDistance = final[0] - initial[0];
      this.animateTravellingWaves(initial, travelDistance, randomDuration, randomRow);
      this.animateWavesRandomly();
    }, randomDelay.ms);
  }

  animateTravellingWaves(initialPeaks, totalTravelDistance, duration, rowIndex, onDone = () => {}) {
    if (this._rowsCurrentlyAnimating.indexOf(rowIndex) > -1) {
      onDone();
      return;
    }

    this._rowsCurrentlyAnimating.push(rowIndex);

    const translationsForTravelDistance = this._coords
      .getTranslationsForTravellingWaves(initialPeaks, totalTravelDistance);

    animateWithEasing(duration, BezierEasing.linear, fractionOfAnimationDone => {
      this._bars[rowIndex].forEach((bar, index) => {
        const travelledSoFar = Math.round(totalTravelDistance * fractionOfAnimationDone);
        const translationsIndex = Math.min(totalTravelDistance - 1, travelledSoFar);
        const translations = translationsForTravelDistance[translationsIndex];
        bar.node.setAttribute("transform", `translate(${translations[index]} 0)`);
      });
    }, { onDone: () => {
      this._rowsCurrentlyAnimating = this._rowsCurrentlyAnimating.filter(i => i !== rowIndex);
      onDone();
    } });
  }

  animateToNoWaves() {
    this._bars.forEach((_, rowIndex) => {
      const initialPeaks = this._currentPeaksPerRow[rowIndex];
      this.animateWaves(initialPeaks, [], Duration.oneSec, rowIndex);
    });
  }

  bindPointerEventsToWaveMovements() {
    this.svgNode.addEventListener("mousemove", event => {
      const { x: pointerX, y: pointerY } = this.getPointerPositionInSVG(event);
      const pointerRow = this.getRowAt(pointerY);

      if (pointerRow == -1) {
        this.animateToNoWaves();
        return;
      }

      this.matchWavePeaksToPointer(pointerX, pointerRow);
    });

    // this.svgNode.addEventListener("mouseleave", () => this.animateToNoWaves());
  }

  matchWavePeaksToPointer(pointerX, pointerRow) {
    originalWavePeaksPerRow.forEach((peaks, rowIndex) => {
      const adjustedPeaks = this.getPeaksAtPointerPosition(
        { peaks, rowIndex },
        { pointerX, pointerRow }
      );
      this._currentPeaksPerRow[rowIndex] = adjustedPeaks;
      this.setWavePeaks({ peaks: adjustedPeaks, rowBars: this._bars[rowIndex] });
    });
  }

  getPeaksAtPointerPosition({ peaks, rowIndex }, { pointerX, pointerRow }) {
    if (pointerRow == rowIndex) {
      return this.peaksAdjustedToEndAt(pointerX, peaks);
    }

    const diff = this.getRightmostPeaksDifference(rowIndex, pointerRow);
    if (pointerRow > rowIndex) {
      return this.peaksAdjustedToEndAt(pointerX - diff, peaks);
    } else {
      return this.peaksAdjustedToEndAt(pointerX + diff, peaks);
    }
  }

  peaksAdjustedToEndAt(x, peaks) {
    const rightMostPeakX = peaks[peaks.length - 1];
    const difference = Math.abs(x - rightMostPeakX);
    const direction = x > rightMostPeakX ? 1 : -1;
    return peaks.map(peakX => peakX + (difference * direction));
  }

  getRightmostPeaksDifference(rowIndex, otherRowIndex) {
    const rowPeaks = originalWavePeaksPerRow[rowIndex];
    const otherRowPeaks = originalWavePeaksPerRow[otherRowIndex];
    return Math.abs(rowPeaks[rowPeaks.length - 1] - otherRowPeaks[otherRowPeaks.length - 1]);
  }

  getPointerPositionInSVG(event){
    this._svgReferencePoint.x = event.clientX;
    this._svgReferencePoint.y = event.clientY;
    return this._svgReferencePoint.matrixTransform(this.svgNode.getScreenCTM().inverse());
  }

  getRowAt(y) {
    return this._rowYs.findIndex(({ top, bottom }) => y >= top && y <= bottom);
  }
}

customElements.define("figure-20-diagram", Figure20Diagram);
