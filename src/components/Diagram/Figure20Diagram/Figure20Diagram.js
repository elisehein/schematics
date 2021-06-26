import { SVGDiagram } from "../Diagram.js";
import WaveCoordinates, { WavePeaks } from "./Figure20WaveCoordinates.js";
import RowBarDrawing from "./Figure20RowBarDrawing.js";

import { registerDurationConvenienceInits  } from "/helpers/Duration.js";
registerDurationConvenienceInits();

export default class Figure20Diagram extends SVGDiagram {
  constructor(...args) {
    super(20, ...args);
    this._waveScaleFactor = 1.2;
  }

  async importDependencies() {
    const modules = await Promise.all([
      import("./Figure20Animations.js"),
      import("./Figure20PointerEvents.js"),
      import("/helpers/random.js")
    ]);
    const Animations = modules[0].default;
    const PointerEvents = modules[1].default;

    this._pointerEvents = new PointerEvents(this.svgNode);
    this._animations = new Animations(
      this._timerManager,
      this.setTranslationForEachBar.bind(this)
    );
    this._randomIntBetween = modules[2].randomIntBetween;
  }

  drawThumbnail() {
    this._drawing = new RowBarDrawing(this.svgSize, this._svgShapeFactory, true);
    this._waves = new WaveCoordinates(
      this._waveScaleFactor, this._drawing.barGap, this._drawing.barsPerRow, this.svgSize, 5
    );
    const { bars } = this.drawBars(false);
    this._bars = bars;
    this.setWavePeaks({ peaks: this.peaksPerRow[0], rowIndex: 0 });
  }

  async drawAfterCaption() {
    this._drawing = new RowBarDrawing(this.svgSize, this._svgShapeFactory);
    this._waves = new WaveCoordinates(
      this._waveScaleFactor, this._drawing.barGap, this._drawing.barsPerRow, this.svgSize
    );
    this._peaksForRowWaveAnimations = this.precalculatePeaksForRowWaveAnimations();

    await this.importDependencies();
    this.drawAndAnimate();
  }

  drawAndAnimate() {
    this._timerManager.setTimeout(() => {
      const { bars, groupNodes } = this.drawBars();
      this._bars = bars;
      this.positionBarsForWaveAnimations();
      this._drawing.animateRowAppearances(groupNodes, this._timerManager, () => {
        this.animateWavesRandomly();
        this.bindPointerEventsToWaveMovements();
      });
    }, 1000);
  }

  drawBars(initiallyInvisible = true) {
    const { bars, groupNodes } = this._drawing.drawBars(barIndex => (
      this._waves.getInitialXForBar(barIndex)
    ), initiallyInvisible);
    groupNodes.forEach(this.addSVGChildElement.bind(this));
    return { bars, groupNodes };
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
      this.toggleBarVisibility(bar, translation);
    });
  }

  toggleBarVisibility(bar, translation) {
    const barX = parseFloat(bar.node.dataset.x) + translation;
    if (barX < 0 || barX > this.svgSize) {
      bar.node.style.visibility = "hidden";
    } else {
      bar.node.style.visibility = "visible";
    }
  }

  positionBarsForWaveAnimations() {
    this.forEachRow(rowIndex => {
      const { initial: peaks } = this._peaksForRowWaveAnimations[rowIndex];
      this.setWavePeaks({ peaks, rowIndex });
    });
  }

  animateWavesRandomly() {
    const randomDelay = this._randomIntBetween(100, 1000).milliseconds();

    this._timerManager.setTimeout(() => {
      if (Math.random() > 0.2) {
        this.animateWaveOnRandomRow();
        this.animateWavesRandomly();
      } else {
        this.animateOriginalWavesInParallel(() => this.animateWavesRandomly());
      }
    }, randomDelay.ms);
  }

  animateWaveOnRandomRow() {
    const randomRow = this._randomIntBetween(0, this._drawing.numberOfRows - 1);
    const peaksOnRow = this.peaksPerRow[randomRow].length;
    const minDurationMS = peaksOnRow * 500;
    const randomDuration = (minDurationMS + this._randomIntBetween(500, 2000)).milliseconds();
    this.animateFullWaveLifecycle(randomDuration, randomRow);
  }

  animateOriginalWavesInParallel(onDone) {
    const animate = () => {
      this.forEachRow(rowIndex => {
        const delay = ((this._drawing.numberOfRows - 1 - rowIndex) * 150).milliseconds();
        this.animateOriginalWavePeaks(rowIndex, delay, () => {
          if (rowIndex == 0) {
            onDone();
          }
        });
      });
    };

    this._animations.waitForAnimationsToFinish((4).seconds(), animate);
  }

  animateOriginalWavePeaks(rowIndex, delay, onDone) {
    const initial = this.peaksPerRow[rowIndex].adjustedBy(this.svgSize * -1);
    const { final } = this._peaksForRowWaveAnimations[rowIndex];
    const travelData = this.getWaveTravelDataWithOverlapAdjustment(initial, final);
    const duration = (4).seconds();
    this._timerManager.setTimeout(() => {
      this.animateTravellingWaves(initial, travelData, { duration }, rowIndex, onDone);
    }, delay.ms);
  }

  animateFullWaveLifecycle(duration, rowIndex) {
    const { initial, final } = this._peaksForRowWaveAnimations[rowIndex];
    const travelData = this.getWaveTravelDataWithOverlapAdjustment(initial, final);
    this.animateTravellingWaves(initial, travelData, { duration }, rowIndex);
  }

  getWaveTravelDataWithOverlapAdjustment(initialPeaks, finalPeaks) {
    const travelDistance = initialPeaks.rightmostPeakDifference(finalPeaks);
    const extraTranslationDuringTravel =
      this._waves.getDistanceToOverlapBarsBetweenPeaks(initialPeaks.length).rightward;
    return {
      travelDistance,
      extraTranslationDuringTravel
    };
  }

  animateTravellingWaves(peaks, travelData, options, rowIndex, onDone = () => {}) {
    const {
      travelDistance: totalTravelDistance,
      extraTranslationDuringTravel = 0
    } = travelData;

    const translations = this._waves
      .getTranslationsForTravellingWaves(peaks, totalTravelDistance)
      .map((translationsAtDistance, distanceTravelled) => {
        const fractionOfDistanceTravelled = distanceTravelled / totalTravelDistance;
        const extraTranslationSoFar = extraTranslationDuringTravel * fractionOfDistanceTravelled;
        return translationsAtDistance.map(barTranslation => (
          barTranslation + extraTranslationSoFar
        ));
      });

    this._animations.animateAcrossTranslations(rowIndex, translations, options, onDone);
  }

  bindPointerEventsToWaveMovements() {
    const pointerIsOnRows = ({ y }) => !this._drawing.positionIsInInsets(y);

    this._pointerEvents.respondToPointer({
      positionRespondsToMovement: pointerIsOnRows,
      onEnter: this.stopAllRowAnimations.bind(this),
      onMove: this.matchWavePeaksToPosition.bind(this),
      onLeave: this.dissolveWavesAndRestartRandomAnimation.bind(this)
    });
  }

  matchWavePeaksToPosition({ x }) {
    // Map x onto a wider range than the svgSize so the wave movement covers a wider area
    const xRange = { min: -100, max: this.svgSize + 100 };
    const adjustedX = x * (xRange.max - xRange.min) / this.svgSize + xRange.min;

    const targetPeaksPerRow = this.getWavePeaksAnchoredTo({ x: adjustedX, anchorRowIndex: 3 });

    this.forEachRow(rowIndex => {
      const targetPeaks = targetPeaksPerRow[rowIndex];
      this.matchWavePeaksToPositionFromCurrentPosition(rowIndex, targetPeaks);
    });
  }

  matchWavePeaksToPositionFromCurrentPosition(rowIndex, targetPeaks) {
    if (this._pointerEvents.pointerJustEntered || this._animations.anyAnimationsInProgress()) {
      this.animateWaveFormationFromCurrentPosition(targetPeaks, rowIndex);
    } else {
      this.setWavePeaks({ peaks: targetPeaks, rowIndex });
    }
  }

  animateWaveFormationFromCurrentPosition(peaks, rowIndex) {
    const duration = (200).milliseconds();
    const initial = this.getCurrentTranslations(rowIndex);
    const final = this._waves.getTranslationsForWaves(peaks);
    this._animations.animateBetweenTranslations(rowIndex, initial, final, { duration });
  }

  dissolveWavesAndRestartRandomAnimation() {
    this.stopAllRowAnimations();

    const duration = (200).milliseconds();
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
      const adjustedFinal = final
        .map(translation => translation + extraTranslationsPerRow[rowIndex]);
      this._animations
        .animateBetweenTranslations(rowIndex, initial, adjustedFinal, options, () => {
          if (rowIndex == 0) {
            onDone();
          }
        });
    };

    this.forEachRow(rowIndex => {
      const delay = 70 * (this._drawing.numberOfRows - rowIndex - 1);
      this._timerManager.setTimeout(dissolveWaves.bind(this, rowIndex), delay);
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
