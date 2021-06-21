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

    this._inProgressAnimationTracker = new InProgressAnimationsTracker(this._timerManager);
    this._currentPeaksPerRow = [...originalWavePeaksPerRow];

    const peaksPerRow = {
      min: originalWavePeaksPerRow[0].length,
      max: originalWavePeaksPerRow[originalWavePeaksPerRow.length - 1].length
    };
    this._coords = new WaveCoordinates(
      1.2, barGap, this._barsPerRow, this.svgSize, peaksPerRow
    );
    this._peaksForRowWaveAnimations = this.precalculatePeaksForRowWaveAnimations();

    window.cancelAnims = () => this._inProgressAnimationTracker.cancelAllAnimations();
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
    this.bindPointerEventsToWaveMovements();

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
    const overflow = this._coords.waveWidth;
    const initial = this.peaksAdjustedToEndAt(-1 * overflow, peaks);

    const finalPeaksStartX = this.svgSize + overflow;
    const final = this.peaksAdjustedToStartAt(finalPeaksStartX, peaks);

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

  positionBarsForWaveAnimations() {
    this._bars.forEach((rowBars, rowIndex) => {
      const { initial: peaks } = this._peaksForRowWaveAnimations[rowIndex];
      this.setWavePeaks({ peaks, rowBars });
    });
  }

  animateWavesRandomly() {
    this.positionBarsForWaveAnimations();
    const randomDelay = new Duration({ milliseconds: randomIntBetween(100, 1000) });

    this._waveAnimationTimer = this._timerManager.setTimeout(() => {
      if (Math.random() > 0.2) {
        this.animateWaveOnRandomRow();
        this.animateWavesRandomly();
      } else {
        this.animateOriginalWavesInParallel(() => this.animateWavesRandomly());
      }
    }, randomDelay.ms);
  }

  animateWaveOnRandomRow() {
    const randomRow = randomIntBetween(0, this._numberOfRows - 1);
    const peaksOnRow = originalWavePeaksPerRow[randomRow].length;
    const minDurationMS = peaksOnRow * 500;
    const randomDuration = new Duration({
      milliseconds: minDurationMS + randomIntBetween(500, 2000)
    });
    this.animateFullWaveLifecycle(randomDuration, randomRow);
  }

  animateOriginalWavesInParallel(onDone) {
    const timeout = new Duration({ seconds: 4 });
    this._inProgressAnimationTracker.waitForAllAnimationsDone(timeout, () => {
      this._bars.forEach((_, rowIndex) => {
        this._timerManager.setTimeout(() => {
          this.animateOriginalWavePattern(rowIndex, () => {
            if (rowIndex == 0) {
              onDone();
            }
          });
        }, (this._bars.length - 1 - rowIndex) * 150);
      });
    });
  }

  animateOriginalWavePattern(rowIndex, onDone) {
    const duration = new Duration({ seconds: 4 });
    const initialPeaks = originalWavePeaksPerRow[rowIndex].map(peakX => peakX - this.svgSize);
    const { final: finalPeaks } = this._peaksForRowWaveAnimations[rowIndex];
    const travelData = this.getWaveTravelDataWithOverlapAdjustment(initialPeaks, finalPeaks);
    const easing = BezierEasing.linear;
    this.animateTravellingWaves(initialPeaks, travelData, duration, easing, rowIndex, onDone);
  }

  animateFullWaveLifecycle(duration, rowIndex) {
    const { initial, final } = this._peaksForRowWaveAnimations[rowIndex];
    const travelData = this.getWaveTravelDataWithOverlapAdjustment(initial, final);
    this.animateTravellingWaves(initial, travelData, duration, BezierEasing.linear, rowIndex);
  }

  getWaveTravelDataWithOverlapAdjustment(initialPeaks, finalPeaks, animateWaveAppearing = false) {
    const travelDistance = finalPeaks[0] - initialPeaks[0];
    const extraTranslationDuringTravel =
      this._coords.getDistanceToOverlapBarsBetweenPeaks(initialPeaks.length);
    return { travelDistance, extraTranslationDuringTravel, animateWaveAppearing };
  }

  animateTravellingWaves(peaks, travelData, duration, easing, rowIndex, onDone = () => {}) {
    const {
      travelDistance: totalTravelDistance,
      extraTranslationDuringTravel,
      animateWaveAppearing
    } = travelData;

    const translationsForTravelDistances = this._coords
      .getTranslationsForTravellingWaves(peaks, totalTravelDistance);

    const waveFullyFormedByAnimationFraction = 0.2;
    const getFractionOfWaveFormed = fractionOfAnimationDone => (
      Math.min(1, fractionOfAnimationDone / waveFullyFormedByAnimationFraction)
    );

    this.animateBarsOnRow(rowIndex, (fractionOfAnimationDone, barIndex) => {
      const extraTranslationSoFar = (extraTranslationDuringTravel || 0) * fractionOfAnimationDone;
      const travelledSoFar = Math.floor(totalTravelDistance * fractionOfAnimationDone);
      const travelTranslations = translationsForTravelDistances[travelledSoFar];
      const fractionOfWaveFormed = getFractionOfWaveFormed(fractionOfAnimationDone);
      const travelTranslation = animateWaveAppearing
        ? travelTranslations[barIndex] * fractionOfWaveFormed
        : travelTranslations[barIndex];
      return travelTranslation + extraTranslationSoFar;
    }, duration, easing, onDone);
  }

  toggleWavePeaksForAllRows(appearing, peaksToToggle, duration, onDone = () => {}) {
    this._bars.forEach((_, rowIndex) => {
      this.toggleWavePeaks(rowIndex, appearing, peaksToToggle[rowIndex], duration, () => {
        if (rowIndex == 0) {
          onDone();
        }
      });
    });
  }

  toggleWavePeaks(rowIndex, appearing, peaksToToggle, duration, onDone = () => {}) {
    const easing = appearing ? BezierEasing.easeInCubic : BezierEasing.easeOutCubic;
    const peaks = {
      initial: appearing ? [] : peaksToToggle,
      final: appearing ? peaksToToggle : []
    };
    this.animateChangingWavePeaks(peaks, duration, easing, rowIndex, () => onDone(rowIndex));
  }

  animateChangingWavePeaks(peaks, duration, easing, rowIndex, onDone = () => {}) {
    const initialTranslations = this._coords.getTranslationsForWaves(peaks.initial);
    const finalTranslations = this._coords.getTranslationsForWaves(peaks.final);

    this.animateBarsOnRow(rowIndex, (fractionOfAnimationDone, barIndex) => {
      const diff = finalTranslations[barIndex] - initialTranslations[barIndex];
      return initialTranslations[barIndex] + (diff * fractionOfAnimationDone);
    }, duration, easing, onDone);
  }

  animateBarsOnRow(rowIndex, barTranslationGetter, duration, easing = BezierEasing.linear, onDone = () => {}) {
    if (this._inProgressAnimationTracker.isRowAnimating(rowIndex)) {
      onDone();
      return;
    }

    const canceler = animateWithEasing(duration, easing, fractionOfAnimationDone => {
      if (fractionOfAnimationDone > 1 || fractionOfAnimationDone < 0) {
        return;
      }

      this.setTranslationForEachBar(rowIndex, barTranslationGetter.bind(null, fractionOfAnimationDone));
    }, { onDone: () => {
      this._inProgressAnimationTracker.unsetRowAnimating(rowIndex);
      onDone();
    } });

    this._inProgressAnimationTracker.setRowAnimating(rowIndex, canceler);
  }

  setTranslationForEachBar(rowIndex, translationGetter) {
    this._bars[rowIndex].forEach((bar, index) => {
      bar.node.setAttribute("transform", `translate(${translationGetter(index)} 0)`);
    });
  }

  bindPointerEventsToWaveMovements() {
    this._wavesAreFollowingPointer = false;

    this.svgNode.addEventListener("mousemove", event => {
      const { x: pointerX, y: pointerY } = this.getPointerPositionInSVG(event);
      const pointerRow = this.getRowAt(pointerY);

      if (pointerRow == -1) {
        if (this._wavesAreFollowingPointer) {
          this._wavesAreFollowingPointer = false;
          this.toggleWavePeaksForAllRows(false, this._currentPeaksPerRow, Duration.oneSec, () => {
            this.animateWavesRandomly();
          });
        }
        return;
      }

      this.stopAllRowAnimations();
      this._wavesAreFollowingPointer = true;
      this.matchWavePeaksToPointer(pointerX, pointerRow);
    });

    this.svgNode.addEventListener("mouseleave", () => {
      if (this._wavesAreFollowingPointer) {
        this._wavesAreFollowingPointer = false;
        this.toggleWavePeaksForAllRows(false, this._currentPeaksPerRow, Duration.oneSec, () => {
          this.animateWavesRandomly();
        });
      }
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

  stopAllRowAnimations() {
    this._timerManager.clearAllIntervals();
    this._timerManager.clearAllTimeouts();
    this._inProgressAnimationTracker.cancelAllAnimations();
  }
}

customElements.define("figure-20-diagram", Figure20Diagram);

class InProgressAnimationsTracker {
  constructor(timerManager) {
    this._animationRefGettersByRowIndex = {};
    this._timerManager = timerManager;
  }

  isRowAnimating(rowIndex) {
    return Object.keys(this._animationRefGettersByRowIndex).indexOf(rowIndex) > -1;
  }

  setRowAnimating(rowIndex, ref) {
    this._animationRefGettersByRowIndex[rowIndex] = ref;
  }

  unsetRowAnimating(rowIndex) {
    delete this._animationRefGettersByRowIndex[rowIndex];
  }

  anyRowsAnimating() {
    return Object.keys(this._animationRefGettersByRowIndex).length > 0;
  }

  cancelAllAnimations() {
    Object.keys(this._animationRefGettersByRowIndex).forEach(rowIndex => {
      window.cancelAnimationFrame(this._animationRefGettersByRowIndex[rowIndex]());
      this.unsetRowAnimating(rowIndex);
    });
  }

  waitForAllAnimationsDone(timeout, onDone) {
    this._timeoutTimer = this._timerManager.setTimeout(() => {
      this._timerManager.clearTimeout(this._timeoutTimer);
      onDone();
    }, timeout.ms);

    this._animationsInProgressChecker = this._timerManager.setInterval(() => {
      if (!this.anyRowsAnimating()) {
        this._timerManager.clearInterval(this._animationsInProgressChecker);
        this._timerManager.clearTimeout(this._timeoutTimer);
        onDone();
      }
    }, 100);
  }
}
