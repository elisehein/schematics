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

    this._coords = new WaveCoordinates(1.2, barGap, this._barsPerRow, this.svgSize);
    this._peaksForRowWaveAnimations = this.precalculatePeaksForRowWaveAnimations();
  }

  importDependencies(callback) {
    Promise.all([
      import("./Figure20Animations.js"),
      import("./Figure20PointerEvents.js")
    ]).then(modules => callback(...modules));
  }

  drawThumbnail() {
  }

  drawBeforeCaption({ onDone }) {
    this._bars = this.drawBars();

    this.importDependencies((animationsModule, pointerEventsModule) => {
      this._pointerEvents = new pointerEventsModule.default(this.svgNode);
      this._animations = new animationsModule.default(
        this._timerManager,
        this.setTranslationForEachBar.bind(this)
      );

      this.animateWavesRandomly();
      this.bindPointerEventsToWaveMovements();
      // onDone()
    });
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
    this._animations.waitForAnimationsToFinish(timeout, () => {
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
    const initialPeaks = originalWavePeaksPerRow[rowIndex].map(peakX => peakX - this.svgSize);
    const { final: finalPeaks } = this._peaksForRowWaveAnimations[rowIndex];
    const travelData = this.getWaveTravelDataWithOverlapAdjustment(initialPeaks, finalPeaks);
    const options = {
      duration: new Duration({ seconds: 4 }),
      easing: BezierEasing.linear
    };
    this.animateTravellingWaves(initialPeaks, travelData, options, rowIndex, onDone);
  }

  animateFullWaveLifecycle(duration, rowIndex) {
    const { initial, final } = this._peaksForRowWaveAnimations[rowIndex];
    const travelData = this.getWaveTravelDataWithOverlapAdjustment(initial, final);
    const options = {
      duration,
      easing: BezierEasing.linear
    };
    this.animateTravellingWaves(initial, travelData, options, rowIndex);
  }

  getWaveTravelDataWithOverlapAdjustment(initialPeaks, finalPeaks, animateWaveAppearing = false) {
    const travelDistance = finalPeaks[0] - initialPeaks[0];
    const extraTranslationDuringTravel =
      this._coords.getDistanceToOverlapBarsBetweenPeaks(initialPeaks.length);
    return { travelDistance, extraTranslationDuringTravel, animateWaveAppearing };
  }

  animateTravellingWaves(peaks, travelData, options, rowIndex, onDone = () => {}) {
    const {
      travelDistance: totalTravelDistance,
      extraTranslationDuringTravel = 0,
      animateWaveAppearing = false
    } = travelData;

    const waveFullyFormedByFractionOfTravelDistance = animateWaveAppearing ? 0.2 : 0;
    const getFractionOfWaveFormed = fractionOfDistanceTravelled => {
      if (waveFullyFormedByFractionOfTravelDistance == 0) {
        return 1;
      }
      return Math.min(1, fractionOfDistanceTravelled / waveFullyFormedByFractionOfTravelDistance)
    };

    const translations = this._coords
      .getTranslationsForTravellingWaves(peaks, totalTravelDistance)
      .map((translationsAtDistance, distanceTravelled) => {
        const fractionOfDistanceTravelled = distanceTravelled / totalTravelDistance;
        const fractionOfWaveFormed = getFractionOfWaveFormed(fractionOfDistanceTravelled);
        const extraTranslationSoFar = extraTranslationDuringTravel * fractionOfDistanceTravelled;
        return translationsAtDistance.map(barTranslation => (
          (barTranslation * fractionOfWaveFormed) + extraTranslationSoFar
        ));
      });

    this._animations.animateAcrossTranslations(rowIndex, translations, options, onDone);
  }

  toggleWavePeaksForAllRows(appearing, peaks, duration, extraTranslation = 0, onDone = () => {}) {
    this._bars.forEach((_, rowIndex) => {
      this.toggleWavePeaks(
        rowIndex, appearing, peaks[rowIndex], duration, extraTranslation, () => {
          if (rowIndex == 0) {
            onDone();
          }
        }
      );
    });
  }

  toggleWavePeaks(rowIndex, appearing, peaksToToggle, duration, extraTranslation, onDone = () => {}) {
    const easing = appearing ? BezierEasing.easeInCubic : BezierEasing.easeOutCubic;
    const options = { duration, easing };

    const peaks = {
      initial: appearing ? [] : peaksToToggle,
      final: appearing ? peaksToToggle : []
    };

    const initialTranslations = this._coords.getTranslationsForWaves(peaks.initial);
    const finalTranslations = this._coords
      .getTranslationsForWaves(peaks.final)
      .map(translation => translation + extraTranslation);

    this._animations.animateBetweenTranslations(
      rowIndex, initialTranslations, finalTranslations, options , onDone
    );
  }

  setTranslationForEachBar(rowIndex, translationGetter) {
    this._bars[rowIndex].forEach((bar, index) => {
      bar.node.setAttribute("transform", `translate(${translationGetter(index)} 0)`);
    });
  }

  bindPointerEventsToWaveMovements() {
    const pointerIsOnRow = ({ y }) => {
      return this.getRowAt(y) > -1;
    }

    this._pointerEvents.respondToPointer({
      positionRespondsToMovement: pointerIsOnRow,
      onMove: this.matchWavePeaksToPosition.bind(this),
      onLeave: this.dissolveWavesAndRestartRandomAnimation.bind(this)
    });
  }

  matchWavePeaksToPosition({ x }) {
    this.stopAllRowAnimations();
    this.getWavePeaksAnchoredTo({ x, anchorRowIndex: 3 })
      .forEach((peaks, rowIndex) => {
        this.setWavePeaks({ peaks, rowBars: this._bars[rowIndex] });
      });
  }

  dissolveWavesAndRestartRandomAnimation({ x }) {
    const peaksToDissolve = this.getWavePeaksAnchoredTo({ x, anchorRowIndex: 3 });
    const duration = new Duration({ milliseconds: 600 });
    const extraTranslation =
      this._coords.getDistanceToOverlapBars({
        initialNumberOfPeaks: peaksToDissolve.length,
        finalNumberOfPeaks: 0
      });
    this.toggleWavePeaksForAllRows(false, peaksToDissolve, duration, extraTranslation, () => {
      this.animateWavesRandomly();
    });
  }

  getWavePeaksAnchoredTo({ x, anchorRowIndex }) {
    return originalWavePeaksPerRow.map((peaks, rowIndex) => {
      if (rowIndex == anchorRowIndex) {
        return this.peaksAdjustedToEndAt(x, peaks);
      }

      const diff = this.getRightmostPeaksDifference(rowIndex, anchorRowIndex)
      const peaksEndX = anchorRowIndex > rowIndex ? x - diff : x + diff;
      return this.peaksAdjustedToEndAt(peaksEndX, peaks);
    });
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

  getRowAt(y) {
    return this._rowYs.findIndex(({ top, bottom }) => y >= top && y <= bottom);
  }

  stopAllRowAnimations() {
    this._timerManager.clearAllIntervals();
    this._timerManager.clearAllTimeouts();
    this._animations.cancelAllAnimations();
  }
}

customElements.define("figure-20-diagram", Figure20Diagram);