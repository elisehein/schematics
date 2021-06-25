import { SVGDiagram } from "../Diagram.js";
import WaveCoordinates, { WavePeaks } from "./Figure20WaveCoordinates.js";
import RowBarDrawing from "./Figure20RowBarDrawing.js";

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
    this._drawing = new RowBarDrawing(this.svgSize, this._svgShapeFactory, true);
    this._waves = new WaveCoordinates(
      this._waveScaleFactor, this._drawing.barGap, this._drawing.barsPerRow, this.svgSize, 5
    );
    this._bars = this.drawBars();
    this.setWavePeaks({ peaks: this.peaksPerRow[0], rowIndex: 0 });
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
      this._pointerEvents = new PointerEvents(this.svgNode);
      this._animations = new Animations(
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

  drawBars() {
    const { bars, groupNodes } = this._drawing.drawBars(barIndex => (
      this._waves.getInitialXForBar(barIndex)
    ));
    groupNodes.forEach(this.addSVGChildElement.bind(this));
    return bars;
  }

  precalculatePeaksForRowWaveAnimations() {
    return this.peaksPerRow.map(peaks => {
      const overflow = Math.round(this._waves.waveWidth);
      const finalPeaksStartX = this.svgSize + overflow;

      return {
        initial: peaks.adjustedToEndAt(-1 * overflow),
        final: peaks.adjustedToStartAt(finalPeaksStartX)
      };
    });
  }

  setWavePeaks({ peaks, rowIndex }) {
    const translatedXCoordinates = this._waves.getTranslationsForWaves(peaks);
    this.setTranslationForEachBar(rowIndex, index => translatedXCoordinates[index]);
  }

  setTranslationForEachBar(rowIndex, translationGetter) {
    this._bars[rowIndex].forEach((bar, index) => {
      const translation = translationGetter(index);
      bar.node.setAttribute("transform", `translate(${translation} 0)`);
      bar.node.dataset.translation = translation; // For easier reference later
    });
  }

  positionBarsForWaveAnimations() {
    this.forEachRow(rowIndex => {
      const { initial: peaks } = this._peaksForRowWaveAnimations[rowIndex];
      this.setWavePeaks({ peaks, rowIndex });
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
    const peaksOnRow = this.peaksPerRow[randomRow].length;
    const minDurationMS = peaksOnRow * 500;
    const randomDuration = new Duration({
      milliseconds: minDurationMS + randomIntBetween(500, 2000)
    });
    this.animateFullWaveLifecycle(randomDuration, randomRow);
  }

  animateOriginalWavesInParallel(onDone) {
    const animate = () => {
      this.forEachRow(rowIndex => {
        const delay = new Duration({
          milliseconds: (this._drawing.numberOfRows - 1 - rowIndex) * 150
        });
        this.animateOriginalWavePeaks(rowIndex, delay, () => {
          if (rowIndex == 0) {
            onDone();
          }
        });
      });
    };

    const timeout = new Duration({ seconds: 4 });
    this._animations.waitForAnimationsToFinish(timeout, animate);
  }

  animateOriginalWavePeaks(rowIndex, delay, onDone) {
    const initialPeaks = this.peaksPerRow[rowIndex].adjustedBy(this.svgSize * -1);
    const { final: finalPeaks } = this._peaksForRowWaveAnimations[rowIndex];
    const travelData = this.getWaveTravelDataWithOverlapAdjustment(initialPeaks, finalPeaks);
    const duration = new Duration({ seconds: 4 });
    this._timerManager.setTimeout(() => {
      this.animateTravellingWaves(initialPeaks, travelData, { duration }, rowIndex, onDone);
    }, delay.ms);
  }

  animateFullWaveLifecycle(duration, rowIndex) {
    const { initial, final } = this._peaksForRowWaveAnimations[rowIndex];
    const travelData = this.getWaveTravelDataWithOverlapAdjustment(initial, final);
    this.animateTravellingWaves(initial, travelData, { duration }, rowIndex);
  }

  getWaveTravelDataWithOverlapAdjustment(
    initialPeaks, finalPeaks, fractionOfWaveFormedBeforeTravel = 1
  ) {
    const travelDistance = initialPeaks.rightmostPeakDifference(finalPeaks);
    const extraTranslationDuringTravel =
      this._waves.getDistanceToOverlapBarsBetweenPeaks(initialPeaks.length).rightward;
    return {
      travelDistance,
      extraTranslationDuringTravel,
      fractionOfWaveFormedBeforeTravel
    };
  }

  animateTravellingWaves(peaks, travelData, options, rowIndex, onDone = () => {}) {
    const {
      travelDistance: totalTravelDistance,
      extraTranslationDuringTravel = 0,
      fractionOfWaveFormedBeforeTravel = 1
    } = travelData;

    const translations = this._waves
      .getTranslationsForTravellingWaves(peaks, totalTravelDistance)
      .map((translationsAtDistance, distanceTravelled) => {
        const fractionOfDistanceTravelled = distanceTravelled / totalTravelDistance;
        const fractionOfWaveFormed =
          this.getFractionOfWaveFormed(fractionOfDistanceTravelled, fractionOfWaveFormedBeforeTravel);
        const extraTranslationSoFar = extraTranslationDuringTravel * fractionOfDistanceTravelled;
        return translationsAtDistance.map(barTranslation => (
          (barTranslation * fractionOfWaveFormed) + extraTranslationSoFar
        ));
      });

    this._animations.animateAcrossTranslations(rowIndex, translations, options, onDone);
  }

  getFractionOfWaveFormed(fractionOfDistanceTravelled, fractionOfWaveFormedBeforeTravel) {
    const fractionOfTravelNeededToFullyFormWave = 0.2;

    const waveFormationDoneByFractionOfTravelDistance =
      fractionOfTravelNeededToFullyFormWave -
      (fractionOfWaveFormedBeforeTravel * fractionOfTravelNeededToFullyFormWave);

    if (waveFormationDoneByFractionOfTravelDistance == 0) {
      return 1;
    }

    const fractionOfWaveFormed = fractionOfWaveFormedBeforeTravel +
      (fractionOfDistanceTravelled / waveFormationDoneByFractionOfTravelDistance);
    return Math.min(1, fractionOfWaveFormed);
  }

  toggleWavePeaks(rowIndex, appearing, peaksToToggle, duration, extraTranslation = 0, onDone = () => {}) {
    const easing = appearing ? BezierEasing.easeInCubic : BezierEasing.easeOutCubic;
    const options = { duration, easing };

    const peaks = {
      initial: appearing ? WavePeaks.none : peaksToToggle,
      final: appearing ? peaksToToggle : WavePeaks.none
    };

    const initialTranslations = this._waves.getTranslationsForWaves(peaks.initial);
    const finalTranslations = this._waves
      .getTranslationsForWaves(peaks.final)
      .map(translation => translation + extraTranslation);

    this._animations.animateBetweenTranslations(
      rowIndex, initialTranslations, finalTranslations, options , onDone
    );
  }

  bindPointerEventsToWaveMovements() {
    const pointerIsOnRows = ({ y }) => !this._drawing.positionIsInInsets(y);

    this._pointerEvents.respondToPointer({
      positionRespondsToMovement: pointerIsOnRows,
      onEnter: this.prepareToAnimatePeaks.bind(this),
      onMove: this.matchWavePeaksToPosition.bind(this),
      onLeave: this.dissolveWavesAndRestartRandomAnimation.bind(this)
    });
  }

  prepareToAnimatePeaks() {
    this.stopAllRowAnimations();
    this._pointerEnteredButNotMovedYet = true;
  }

  matchWavePeaksToPosition({ x }) {
    // Map x onto a wider range than the svgSize so the wave movement covers a wider area
    const xRange = { min: -150, max: this.svgSize + 150 };
    const adjustedX = x * (xRange.max - xRange.min) / this.svgSize + xRange.min;

    const targetPeaksPerRow = this.getWavePeaksAnchoredTo({ x: adjustedX, anchorRowIndex: 3 });

    this.forEachRow(rowIndex => {
      const targetPeaks = targetPeaksPerRow[rowIndex];
      this.matchWavePeaksToPositionFromCurrentPosition(rowIndex, targetPeaks);
    });

    this._pointerEnteredButNotMovedYet = false;
  }

  matchWavePeaksToPositionFromCurrentPosition(rowIndex, targetPeaks) {
    if (this._pointerEnteredButNotMovedYet || this._animations.anyAnimationsInProgress()) {
      this.animateWaveFormationFromCurrentPosition(targetPeaks, rowIndex);
    } else {
      this.setWavePeaks({ peaks: targetPeaks, rowIndex });
    }
  }

  animateWaveFormationFromCurrentPosition(peaks, rowIndex) {
    const duration = new Duration({ milliseconds: 200 });
    const initial = this.getCurrentTranslations(rowIndex);
    const final = this._waves.getTranslationsForWaves(peaks);
    this._animations.animateBetweenTranslations(rowIndex, initial, final, { duration });
  }

  dissolveWavesAndRestartRandomAnimation() {
    this.stopAllRowAnimations();
    this._pointerEnteredButNotMovedYet = false;

    const duration = new Duration({ milliseconds: 200 });
    const extraTranslations = this.peaksPerRow.map(peaks => (
      this._waves.getDistanceToOverlapBars({
        numberOfPeaks: 0,
        otherNumberOfPeaks: peaks.length
      }).min
    ));

    this.dissolveWavesAfterIncreasingDelay(extraTranslations, { duration }, () => {
      this.animateWavesRandomly();
    });
  }

  dissolveWavesAfterIncreasingDelay(extraTranslationsPerRow, options, onDone) {
    const final = this._waves.getTranslationsForWaves(WavePeaks.none);

    const dissolveWaves = rowIndex => {
      const initial = this.getCurrentTranslations(rowIndex);
      const adjustedFinal = final.map(translation => translation + extraTranslationsPerRow[rowIndex]);
      this._animations
        .animateBetweenTranslations(rowIndex, initial, adjustedFinal, options, () => {
          if (rowIndex == 0) {
            onDone();
          }
        });
    };

    this.forEachRow(rowIndex => {
      this._timerManager.setTimeout(() => {
        dissolveWaves(rowIndex);
      }, 70 * (this._drawing.numberOfRows - rowIndex - 1));
    });
  }

  getWavePeaksAnchoredTo({ x, anchorRowIndex }) {
    return this.peaksPerRow.map((peaks, rowIndex) => {
      const anchorPeaks = this.peaksPerRow[anchorRowIndex];
      const diff = peaks.rightmostPeakDifference(anchorPeaks);
      const peaksEndX = anchorRowIndex > rowIndex ? x - diff : x + diff;
      return peaks.adjustedToEndAt(peaksEndX);
    });
  }

  stopAllRowAnimations() {
    this._timerManager.clearAllIntervals();
    this._timerManager.clearAllTimeouts();
    this._animations.cancelAllAnimations();
  }

  forEachRow(callback) {
    for (let rowIndex = 0; rowIndex < this._drawing.numberOfRows; rowIndex += 1) {
      callback(rowIndex, this._bars[rowIndex]);
    }
  }

  getCurrentTranslations(rowIndex) {
    return this._bars[rowIndex].map(bar => parseFloat(bar.node.dataset.translation || 0));
  }

  get peaksPerRow() {
    return this._drawing.peaksPerRow.map(peaks => new WavePeaks(peaks));
  }
}

customElements.define("figure-20-diagram", Figure20Diagram);
