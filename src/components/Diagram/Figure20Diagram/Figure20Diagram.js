import { SVGDiagram } from "../Diagram.js";
import WaveCoordinates from "./Figure20WaveCoordinates.js";

import BezierEasing from "/helpers/BezierEasing.js";
import Duration from "/helpers/Duration.js";
import animateWithEasing from "/helpers/animateWithEasing.js";

const wavePeaksPerBar = [
  [0],
  [40],
  [0, 70],
  [40, 125],
  [0, 85, 170],
  [40, 125, 210],
  [0, 85, 170, 255]
];

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

  connectedCallback() {
    super.connectedCallback();
    this._svgReferencePoint = this.svgNode.createSVGPoint();
  }

  drawThumbnail() {
  }

  drawBeforeCaption({ onDone }) {
    this._bars = this.drawBars();

    wavePeaksPerBar.forEach((peaks, barIndex) => {
      this.setWavePeaks({ peaks, rowBars: this._bars[barIndex] });
    });

    // Animate waves from left overflow to right overflow
    const travelDistance = this.svgSize * 2;
    wavePeaksPerBar.forEach((peaks, barIndex) => {
      const initialPeaks = peaks.map(x => x - (this.svgSize / 2));
      // this.animateWaves(initialPeaks, travelDistance, this._bars[barIndex]);
    });

    this.bindPointerEventsToWaveMovements();

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

  setWavePeaks({ peaks, rowBars }) {
    const translatedXCoordinates = this._coords.getTranslationsForWaves(peaks);
    rowBars.forEach((bar, index) => {
      bar.node.setAttribute("transform", `translate(${translatedXCoordinates[index]} 0)`);
    });
  }

  animateWaves(initialPeaks, totalTravelDistance, rowBars) {
    const translationsForTravelDistance = this._coords
      .getTranslationsForTravellingWaves(initialPeaks, totalTravelDistance);

    const duration = new Duration({ seconds: 2 });

    rowBars.forEach((bar, index) => {
      animateWithEasing(duration, BezierEasing.linear, fractionOfAnimationDone => {
      const travelledSoFar = Math.round(totalTravelDistance * fractionOfAnimationDone);
      const translationsIndex = Math.min(totalTravelDistance - 1, travelledSoFar);
      const translations = translationsForTravelDistance[translationsIndex];

        bar.node.setAttribute("transform", `translate(${translations[index]} 0)`);
      }, { onDone: () => {
        if (index == 0) {
          this._timerManager.setTimeout(() => {
            this.animateWaves(initialPeaks, totalTravelDistance, rowBars);
          }, 100);
        }
      } });
    });
  }

  bindPointerEventsToWaveMovements() {
    this.addEventListener("mousemove", event => {
      const { x: pointerX } = this.getPointerPositionInSVG(event);

      wavePeaksPerBar.forEach((peaks, barIndex) => {
        this.setWavePeaks({
          peaks: this.peaksAdjustedToEndAt(pointerX, peaks),
          rowBars: this._bars[barIndex]
        });
      });
    });
  }

  peaksAdjustedToEndAt(x, peaks) {
    const rightMostPeakX = peaks[peaks.length - 1];
    const difference = Math.abs(x - rightMostPeakX);
    const direction = x > rightMostPeakX ? 1 : -1;
    return peaks.map(peakX => peakX + (difference * direction));
  }

  getPointerPositionInSVG(event){
    this._svgReferencePoint.x = event.clientX;
    this._svgReferencePoint.y = event.clientY;
    return this._svgReferencePoint.matrixTransform(this.svgNode.getScreenCTM().inverse());
  }
}

customElements.define("figure-20-diagram", Figure20Diagram);
