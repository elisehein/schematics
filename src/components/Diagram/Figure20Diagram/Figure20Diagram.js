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
  constructor(...args) {
    super(20, ...args);

    this._numberOfRows = 7;
    const numberOfGaps = this._numberOfRows - 1;
    const barGap = 10;
    this._barsPerRow = 90;
    this._verticalInset = 15;

    const rowToRowGapRatio = 0.8;
    const height = 300 - (2 * this._verticalInset);
    this._rowGap =  height / (this._numberOfRows * rowToRowGapRatio + numberOfGaps);
    this._rowHeight = this._rowGap * rowToRowGapRatio;
    this._rowYs = this.precalculateRowYs();

    this._inProgressAnimationTracker = new InProgressAnimationsTracker();
    this._currentPeaksPerRow = originalWavePeaksPerRow;

    const peaksPerRow = {
      min: originalWavePeaksPerRow[0].length,
      max: originalWavePeaksPerRow[originalWavePeaksPerRow.length - 1].length
    }
    this._coords = new WaveCoordinates(
      1.2, barGap, this._barsPerRow, this.svgSize, peaksPerRow
    );
    this._peaksForRowWaveAnimations = this.precalculatePeaksForRowWaveAnimations();
  }

  connectedCallback() {
    super.connectedCallback();
    this._svgReferencePoint = this.svgNode.createSVGPoint();
  }

  drawThumbnail() {
  }

  drawBeforeCaption({ onDone }) {
    this._bars = this.drawBars();
    this.positionBarsForWaveAnimations();
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

  /* We want the initial and final peaks on a row during an animation be positioned
   * so that the bars in between line up perfectly. This is to avoid the jump of the whole
   * row when going from final peaks back to initial peaks at the start of an animation. */
  getPeaksForRowWaveAnimation(peaks) {
    const overflow = this._coords.waveWidth;
    const initial = this.peaksAdjustedToEndAt(-1 * overflow, peaks);

    const finalPeaksStartX = this.svgSize + overflow;
    const final = this.peaksAdjustedToStartAt(finalPeaksStartX, peaks);

    return { initial, final };
  }

  drawBars(red) {
    const bars = [];

    for (let rowIndex = 0; rowIndex < this._numberOfRows; rowIndex += 1) {
      const barsForRow = [];
      const groupNode = this._svgShapeFactory.getGroupNode();
      groupNode.dataset.rowIndex = rowIndex;
      const { top: topY, bottom: bottomY } = this._rowYs[rowIndex];

      for (let barIndex = 0; barIndex < this._barsPerRow; barIndex += 1) {
        const bar = this.drawBar(topY, bottomY, barIndex);
        if (red) {
          bar.node.style.stroke = "red";
        }
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

  positionBarsForWaveAnimations() {
    this._bars.forEach((rowBars, rowIndex) => {
      const { initial: peaks } = this._peaksForRowWaveAnimations[rowIndex];
      this.setWavePeaks({ peaks, rowBars });
    });
  }

  animateWavesRandomly() {
    const randomDelay = new Duration({ milliseconds: randomIntBetween(100, 1000) });
    const randomDuration = new Duration({ milliseconds: randomIntBetween(1000, 3000) });
    const randomRow = randomIntBetween(0, this._numberOfRows - 1);

    this._waveAnimationTimer = this._timerManager.setTimeout(() => {
      this.animateFullWaveLifecycle(randomDuration, randomRow);
      this.animateWavesRandomly();
    }, randomDelay.ms);
  }

  animateFullWaveLifecycle(duration, rowIndex) {
    const { initial, final } = this._peaksForRowWaveAnimations[rowIndex];
    const travelDistance = final[0] - initial[0];
    const extraTranslationDuringTravel = this._coords.getDistanceToOverlapBarsBetweenPeaks(initial.length);
    const travelData = { travelDistance, extraTranslationDuringTravel };
    this.animateTravellingWaves(initial, travelData, duration, rowIndex);
  }

  // Needs better function name.
  // This function translates the entire row by a little bit so that when
  // the row wave(s) begin travelling again from the left, there is no jump
  // (the bars already overlap)
  translateRowGroupToOverlapBars(numberOfPeaks, rowIndex) {
    const compensation = this._coords.getDistanceToOverlapBarsBetweenPeaks(numberOfPeaks);
    this.querySelectorAll("g")[rowIndex].style.transition = `transform .3s ${BezierEasing.easeOutCubic.cssString}`;
    this.querySelectorAll("g")[rowIndex].setAttribute("transform", `translate(${compensation} 0)`);
  }

  animateTravellingWaves(initialPeaks, travelData, duration, rowIndex, onDone = () => {}) {
    const { travelDistance: totalTravelDistance, extraTranslationDuringTravel } = travelData;
    const translationsForTravelDistances = this._coords
      .getTranslationsForTravellingWaves(initialPeaks, totalTravelDistance);

      this.animateBarsOnRow(rowIndex, (fractionOfAnimationDone, barIndex) => {
        const travelledSoFar = Math.floor(totalTravelDistance * fractionOfAnimationDone);
        const translations = translationsForTravelDistances[travelledSoFar];
        return translations[barIndex] + (extraTranslationDuringTravel || 0) * fractionOfAnimationDone;
      }, duration, onDone);
  }

  animateDisappearingWaves(disappearingPeaks) {
    this._bars.forEach((_, rowIndex) => {
      this.animateChangingWavePeaks(disappearingPeaks[rowIndex], [], Duration.oneSec, rowIndex);
    });
  }

  animateAppearingWaves(appearingPeaks) {
    this._bars.forEach((_, rowIndex) => {
      this.animateChangingWavePeaks([], appearingPeaks[rowIndex], Duration.oneSec, rowIndex);
    });
  }

  animateChangingWavePeaks(initialPeaks, finalPeaks, duration, rowIndex, onDone = () => {}) {
    const initialTranslations = this._coords.getTranslationsForWaves(initialPeaks);
    const finalTranslations = this._coords.getTranslationsForWaves(finalPeaks);

    this.animateBarsOnRow(rowIndex, (fractionOfAnimationDone, barIndex) => {
      const diff = finalTranslations[barIndex] - initialTranslations[barIndex];
      return initialTranslations[barIndex] + (diff * fractionOfAnimationDone);
    }, duration, onDone);
  }

  animateBarsOnRow(rowIndex, barTranslationGetter, duration, onDone = () => {}) {
    if (this._inProgressAnimationTracker.isRowAnimating(rowIndex)) {
      onDone();
      return;
    }

    this._inProgressAnimationTracker.setRowAnimating(rowIndex, true);

    animateWithEasing(duration, BezierEasing.linear, fractionOfAnimationDone => {
      if (fractionOfAnimationDone > 1 || fractionOfAnimationDone < 0) {
        return;
      }

      this.setTranslationForEachBar(rowIndex, barTranslationGetter.bind(null, fractionOfAnimationDone));
    }, { onDone: () => {
      this._inProgressAnimationTracker.setRowAnimating(rowIndex, false);
      onDone();
    } });
  }

  setTranslationForEachBar(rowIndex, translationGetter) {
    this._bars[rowIndex].forEach((bar, index) => {
      bar.node.setAttribute("transform", `translate(${translationGetter(index)} 0)`);
    });
  }

  bindPointerEventsToWaveMovements() {
    this.svgNode.addEventListener("mousemove", event => {
      const { x: pointerX, y: pointerY } = this.getPointerPositionInSVG(event);
      const pointerRow = this.getRowAt(pointerY);

      if (pointerRow == -1) {
        this.animateDisappearingWaves(this._currentPeaksPerRow);
        return;
      }

      this.matchWavePeaksToPointer(pointerX, pointerRow);
    });

    this.svgNode.addEventListener("mouseleave", () => {
      this.animateDisappearingWaves(this._currentPeaksPerRow);
    });
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
    const rightmostPeakX = peaks[peaks.length - 1];
    const difference = Math.abs(x - rightmostPeakX);
    const direction = x > rightmostPeakX ? 1 : -1;
    return peaks.map(peakX => peakX + (difference * direction));
  }

  peaksAdjustedToStartAt(x, peaks) {
    const leftmostPeak = peaks[0];
    const difference = Math.abs(x - leftmostPeak);
    const direction = x > leftmostPeak ? 1 : -1;
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

class InProgressAnimationsTracker {
  constructor() {
    this._rowsCurrentlyAnimating = [];
  }

  isRowAnimating(rowIndex) {
    return this._rowsCurrentlyAnimating.indexOf(rowIndex) > -1;
  }

  setRowAnimating(rowIndex, animating) {
    if (animating) {
      this._rowsCurrentlyAnimating.push(rowIndex);
    } else {
      this._rowsCurrentlyAnimating = this._rowsCurrentlyAnimating
        .filter(index => index !== rowIndex);
    }
  }
}
