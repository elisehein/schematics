import { SVGDiagram } from "../Diagram.js";
import WaveCoordinates from "./Figure20WaveCoordinates.js";
import RowBarDrawing, { originalPeaksPerRow } from "./Figure20RowBarDrawing.js";

import BezierEasing from "/helpers/BezierEasing.js";
import { randomIntBetween } from "/helpers/random.js";
import Duration from "/helpers/Duration.js";

export default class Figure20Diagram extends SVGDiagram {
  constructor(...args) {
    super(20, ...args);

    this._waveScaleFactor = 1.2;
  }

  importDependencies(callback) {
    Promise.all([
      import("./Figure20Animations.js"),
      import("./Figure20PointerEvents.js")
    ]).then(modules => callback(modules[0].default, modules[1].default));
  }

  drawThumbnail() {
  }

  drawBeforeCaption({ onDone }) {
    this._drawing = new RowBarDrawing(this.svgSize, this._svgShapeFactory);
    this._waves = new WaveCoordinates(
      this._waveScaleFactor, this._drawing.barGap, this._drawing.barsPerRow, this.svgSize
    );
    this._peaksForRowWaveAnimations = this.precalculatePeaksForRowWaveAnimations();
    this._bars = this.drawBars();
    this.positionBarsForWaveAnimations();

    this.importDependencies((Animations, PointerEvents) => {
      this._pointerEvents = new PointerEvents(this.svgNode, this._timerManager);
      this._animations = new Animations(
        this._timerManager,
        this.setTranslationForEachBar.bind(this)
      );

      this.animateWavesRandomly();
      this.bindPointerEventsToWaveMovements();

      window.addEventListener("blur", () => this.stopAllRowAnimations());
      window.addEventListener("focus", () => this.animateWavesRandomly());

      // onDone()
    });
  }

  drawAfterCaption() {
  }

  drawBars() {
    const { bars, groupNodes } = this._drawing.drawBars(barIndex => (
      this._waves.getInitialXForBar(barIndex)
    ));
    groupNodes.forEach(this.addSVGChildElement.bind(this));
    return bars;
  }

  precalculatePeaksForRowWaveAnimations() {
    return originalPeaksPerRow.map(peaks => {
      const overflow = this._waves.waveWidth;
      const initial = this.peaksAdjustedToEndAt(-1 * overflow, peaks);

      const finalPeaksStartX = this.svgSize + overflow;
      const final = this.peaksAdjustedToStartAt(finalPeaksStartX, peaks);

      return { initial, final };
    });
  }

  setWavePeaks({ peaks, rowBars }) {
    const translatedXCoordinates = this._waves.getTranslationsForWaves(peaks);
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
    const randomRow = randomIntBetween(0, this._drawing.numberOfRows - 1);
    const peaksOnRow = originalPeaksPerRow[randomRow].length;
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
    const initialPeaks = originalPeaksPerRow[rowIndex].map(peakX => peakX - this.svgSize);
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
      this._waves.getDistanceToOverlapBarsBetweenPeaks(initialPeaks.length).rightward;
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
      return Math.min(1, fractionOfDistanceTravelled / waveFullyFormedByFractionOfTravelDistance);
    };

    const translations = this._waves
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

  toggleWavePeaksForAllRows(appearing, peaks, duration, extraTranslations, onDone = () => {}) {
    this._bars.forEach((_, rowIndex) => {
      const extraTranslation = extraTranslations[rowIndex];
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

    const initialTranslations = this._waves.getTranslationsForWaves(peaks.initial);
    const finalTranslations = this._waves
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
    const pointerIsOnRow = ({ y }) => this._drawing.getRowAt(y) > -1;

    this._pointerEvents.respondToPointer({
      positionRespondsToMovement: pointerIsOnRow,
      onEnter: this.stopAllRowAnimations.bind(this),
      onMove: this.matchWavePeaksToPosition.bind(this),
      onLeave: this.dissolveWavesAndRestartRandomAnimation.bind(this)
    });
  }

  matchWavePeaksToPosition({ x }) {
    this.getWavePeaksAnchoredTo({ x, anchorRowIndex: 3 })
      .forEach((peaks, rowIndex) => {
        this.setWavePeaks({ peaks, rowBars: this._bars[rowIndex] });
      });
  }

  dissolveWavesAndRestartRandomAnimation({ x }) {
    const peaksPerRow = this.getWavePeaksAnchoredTo({ x, anchorRowIndex: 3 });
    const duration = new Duration({ milliseconds: 1600 });
    const extraTranslations = peaksPerRow.map(peaks => (
      this._waves.getDistanceToOverlapBars({
        initialNumberOfPeaks: peaks.length,
        finalNumberOfPeaks: 0
      }).min
    ));
    this.toggleWavePeaksForAllRows(false, peaksPerRow, duration, extraTranslations, () => {
      this.animateWavesRandomly();
    });
  }

  getWavePeaksAnchoredTo({ x, anchorRowIndex }) {
    return originalPeaksPerRow.map((peaks, rowIndex) => {
      if (rowIndex == anchorRowIndex) {
        return this.peaksAdjustedToEndAt(x, peaks);
      }

      const diff = this.getRightmostPeaksDifference(rowIndex, anchorRowIndex);
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
    const rowPeaks = originalPeaksPerRow[rowIndex];
    const otherRowPeaks = originalPeaksPerRow[otherRowIndex];
    return Math.abs(rowPeaks[rowPeaks.length - 1] - otherRowPeaks[otherRowPeaks.length - 1]);
  }

  stopAllRowAnimations() {
    this._timerManager.clearAllIntervals();
    this._timerManager.clearAllTimeouts();
    this._animations.cancelAllAnimations();
  }
}

customElements.define("figure-20-diagram", Figure20Diagram);
