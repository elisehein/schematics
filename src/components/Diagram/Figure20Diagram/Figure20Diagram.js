import { SVGDiagram } from "../Diagram.js";
import WaveCoordinates, { WavePeaks } from "./Figure20WaveCoordinates.js";
import RowBarDrawing, { originalPeaksPerRowData } from "./Figure20RowBarDrawing.js";

import BezierEasing from "/helpers/BezierEasing.js";
import { randomIntBetween } from "/helpers/random.js";
import Duration from "/helpers/Duration.js";

const originalPeaksPerRow = originalPeaksPerRowData.map(peaks => new WavePeaks(peaks));

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

      // this.animateWavesRandomly();
      // this.bindPointerEventsToWaveMovements();
      this.animateTravellingWaves(
        new WavePeaks([150]),
        { travelDistance: 100, fractionOfWaveFormedBeforeTravel: 0.9 },
        { duration: new Duration({ seconds: 5 }), easing: BezierEasing.linear },
        0
      );

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
    const peaksOnRow = originalPeaksPerRow[randomRow].length;
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
    const initialPeaks = originalPeaksPerRow[rowIndex].adjustedBy(this.svgSize * -1);
    const { final: finalPeaks } = this._peaksForRowWaveAnimations[rowIndex];
    const travelData = this.getWaveTravelDataWithOverlapAdjustment(initialPeaks, finalPeaks);
    const options = {
      duration: new Duration({ seconds: 4 }),
      easing: BezierEasing.linear
    };
    this._timerManager.setTimeout(() => {
      this.animateTravellingWaves(initialPeaks, travelData, options, rowIndex, onDone);
    }, delay.ms);
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

  toggleWavePeaks(rowIndex, appearing, peaksToToggle, duration, extraTranslation, onDone = () => {}) {
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
    const pointerIsOnRow = ({ y }) => this._drawing.getRowAt(y) > -1;

    this._pointerEvents.respondToPointer({
      positionRespondsToMovement: pointerIsOnRow,
      onEnter: this.stopAllRowAnimations.bind(this),
      onMove: this.matchWavePeaksToPosition.bind(this),
      onLeave: () => {}
      // onLeave: this.dissolveWavesAndRestartRandomAnimation.bind(this)
    });
  }

  matchWavePeaksToPosition({ x }) {
    // If peaks not fully formed yet,
    //   - animate peak formation while moving from the position they were in before
    // else
    //   - no animation, set peaks to given position
    const targetPeaks = this.getWavePeaksAnchoredTo({ x, anchorRowIndex: 3 });
    const currentTranslations = this._bars.map(rowBars => (
      rowBars.map(bar => parseFloat(bar.node.dataset.translation))
    ));

    if (this._waveFormationInProgress) {

    } else {
      targetPeaks.forEach((peaks, rowIndex) => {
        this.setWavePeaks({ peaks, rowIndex });
      });
    }
  }

  dissolveWavesAndRestartRandomAnimation({ x }) {
    // Need to dissolve taking into account how far along the wave had actually
    // formed in the first place
    const peaksPerRow = this.getWavePeaksAnchoredTo({ x, anchorRowIndex: 3 });
    const duration = new Duration({ milliseconds: 500 });
    const extraTranslations = peaksPerRow.map(peaks => (
      this._waves.getDistanceToOverlapBars({
        initialNumberOfPeaks: peaks.length,
        finalNumberOfPeaks: 0
      }).min
    ));

    this.dissolveWavesAfterIncreasingDelay(peaksPerRow, extraTranslations, duration);
  }

  dissolveWavesAfterIncreasingDelay(peaksPerRow, extraTranslations, duration) {
    const dissolveWaves = rowIndex => {
      this.toggleWavePeaks(
        rowIndex, false, peaksPerRow[rowIndex], duration, extraTranslations[rowIndex], () => {
          if (rowIndex == 0) {
            this.animateWavesRandomly();
          }
        }
      );
    };

    this.forEachRow(rowIndex => {
      this._timerManager.setTimeout(() => {
        dissolveWaves(rowIndex);
      }, 70 * (this._drawing.numberOfRows - rowIndex - 1));
    });
  }

  getWavePeaksAnchoredTo({ x, anchorRowIndex }) {
    return originalPeaksPerRow.map((peaks, rowIndex) => {
      if (rowIndex == anchorRowIndex) {
        return peaks.adjustedToEndAt(x);
      }

      const anchorPeaks = originalPeaksPerRow[anchorRowIndex];
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
}

customElements.define("figure-20-diagram", Figure20Diagram);
