export default class WaveCoordinates {
  constructor(waveScaleFactor, barGap, barsPerRow, viewportWidth, minDistanceFromPeak = 1.5) {
    this._barsPerRow = barsPerRow;
    this._barGap = barGap;

    const maxBarsFromPeak = barsPerRow - 1;
    this._distancesFromWavePeak = generateDistancesFromWavePeak(
      waveScaleFactor, barGap, maxBarsFromPeak, minDistanceFromPeak
    );
    this._initialXCoordsForBars = this.getInitialXCoordsForBars(viewportWidth);
    this._memoizedTranslationsForWavePeaks = {};
  }

  getInitialXCoordsForBars(viewportWidth) {
    // Half the bars go to the left of the midpoint, and the other half to the right,
    // creating overflow on both sides for translations during animation.
    const rowWidth = this._barsPerRow * this._barGap;
    const firstBarX = (rowWidth - viewportWidth) / -2;

    return Array(this._barsPerRow)
      .fill()
      .map((_, barIndex) => firstBarX + (barIndex * this._barGap));
  }

  getInitialXForBar(index) {
    return this._initialXCoordsForBars[index];
  }

  getTranslationsForWaves(peaks) {
    if (this._memoizedTranslationsForWavePeaks[peaks.key]) {
      return this._memoizedTranslationsForWavePeaks[peaks.key];
    }

    const initialTranslations = Array(this._barsPerRow).fill(0);
    const translations = peaks.values.reduce((translationsSoFar, peakX, waveCenterIndex) => {
      const upcomingWaves = peaks.length - 1 - waveCenterIndex;
      return this.getTranslationsForWave(peakX, upcomingWaves, translationsSoFar);
    }, initialTranslations);

    this._memoizedTranslationsForWavePeaks[peaks.key] = translations;
    return translations;
  }

  getTranslationsForWave(peakX, upcomingWaves, translationsSoFar) {
    const maxTranslation = this._distancesFromWavePeak[this._distancesFromWavePeak.length - 1];
    const xAdjustedForUpcomingWaves = peakX - (upcomingWaves * maxTranslation);
    const peakBarIndex = this.getClosestBarIndex(xAdjustedForUpcomingWaves, translationsSoFar);

    return Array(this._barsPerRow)
      .fill()
      .map((_, index) => {
      const currentTranslation = translationsSoFar[index];

      if (index == peakBarIndex) {
        return currentTranslation;
      }

      const barsFromPeak = Math.abs(peakBarIndex - index);
      const direction = index > peakBarIndex ? 1 : -1;
      const translationAmount = this._distancesFromWavePeak[barsFromPeak - 1];
      return currentTranslation - (translationAmount * direction);
    });
  }

  getClosestBarIndex(x, translationsSoFar) {
    return this._initialXCoordsForBars.map((initialX, index) => ({
        x: initialX + translationsSoFar[index],
        index
      }))
      .reduce((prevXandIndex, currXandIndex) => (
        Math.abs(currXandIndex.x - x) < Math.abs(prevXandIndex.x - x)
        ? currXandIndex
        : prevXandIndex
      )).index;
  }

  getTranslationsForTravellingWaves(initialPeaks, totalTravelDistance) {

    /* We only calculate translations at each integer for now.
     * If the animation speed is reduced a lot, we may need to also calculate
     * translations at fractional wave travel distances. That will require a map instead of an array.
     * +1 to account for zero distance travelled */
    return Array(Math.floor(totalTravelDistance) + 1).fill()
      .map((_, distanceTravelledSoFar) => {
        const adjustedPeaks = initialPeaks.adjustedBy(distanceTravelledSoFar);
        return this.getTranslationsForWaves(adjustedPeaks);
      });
  }

  getDistanceToOverlapBarsBetweenPeaks(numberOfPeaks) {
    return this.getDistanceToOverlapBars({
      numberOfPeaks,
      otherNumberOfPeaks: numberOfPeaks
    });
  }

  getDistanceToOverlapBars({ numberOfPeaks, otherNumberOfPeaks }) {
    const maxTranslation = (numberOfPeaks + otherNumberOfPeaks) * this.waveWidth;
    const barsPerCumulativeTranslation = Math.floor(maxTranslation / this._barGap);
    const rightWardCompensation = (barsPerCumulativeTranslation + 1) * this._barGap - maxTranslation;
    const leftwardCompensation = this._barGap - rightWardCompensation;

    const roundedRightWardCompensation = Math.round(rightWardCompensation * 10) / 10;
    const roundedLeftwardCompensation = Math.round(leftwardCompensation * 10) / 10;

    return {
      rightward: roundedRightWardCompensation,
      leftward: roundedLeftwardCompensation * -1,
      min: (leftwardCompensation > rightWardCompensation
        ? roundedRightWardCompensation
        : roundedLeftwardCompensation * -1
      ),
      max: (leftwardCompensation < rightWardCompensation
        ? roundedRightWardCompensation
        : roundedLeftwardCompensation * -1
      )
    };
  }

  get waveWidth() {
    // This refers to the total reach from the left to the right of the wave
    // where the ripple effect (bar density) is visible.
    return this._distancesFromWavePeak[this._distancesFromWavePeak.length - 1];
  }
}

function generateDistancesFromWavePeak(scaleFactor, barGap, maxBarsFromWaveCenter, minDistanceFromPeak) {
  const distanceGetter = getDistanceGetter(scaleFactor, minDistanceFromPeak, barGap);

  return Array(maxBarsFromWaveCenter)
    .fill()
    .map((_, index) => {
      const distanceFromWaveCenter = distanceGetter(index + 1);
      const distanceBetweenBars = (index + 1) * barGap;
      return Math.round((distanceBetweenBars - distanceFromWaveCenter) * 10) / 10;
    });
}

function getDistanceGetter(scaleFactor, minDistance, maxDistance) {
  const getDistances = (distancesSoFar = [minDistance]) => {
    const length = distancesSoFar.length;
    const previousDistance = length > 1 ? distancesSoFar[length - 2] : 0;
    const currentDistance = distancesSoFar[length - 1];
    const nextDistance = scaleDistance(currentDistance, previousDistance, scaleFactor);

    if (nextDistance - currentDistance < maxDistance) {
      const newDistances = [...distancesSoFar, nextDistance];
      return getDistances(newDistances);
    } else {
      return distancesSoFar;
    }
  };

  const distances = getDistances();

  return distance => {
    if (distance > distances.length) {
      return distances[distances.length - 1] + ((distance - distances.length) * maxDistance);
    } else {
      return distances[distance - 1];
    }
  };
}

function scaleDistance(distance, previousDistance, scaleFactor) {
  const differenceBetweenDistances = distance - previousDistance;
  const scaledDifference = differenceBetweenDistances * scaleFactor;
  return distance + scaledDifference;
}

export function WavePeaks(peaks) {
  const rightmostPeak = peaks[peaks.length - 1];
  const leftmostPeak = peaks[0];
  const length = peaks.length;
  const key = peaks.length ? peaks.join(";") : "empty";
  const values = peaks;

  return Object.freeze({
    values,
    length,
    rightmostPeak,
    leftmostPeak,
    key,

    rightmostPeakDifference(otherWavePeaks) {
      return Math.abs(rightmostPeak - otherWavePeaks.rightmostPeak);
    },

    adjustedBy(x) {
      return new WavePeaks(peaks.map(peak => peak + x));
    },

    anchoredTo(x, anchorPoint) {
      const difference = Math.abs(x - anchorPoint);
      const direction = x > anchorPoint ? 1 : -1;
      return this.adjustedBy(difference * direction);
    },

    adjustedToStartAt(x) {
      return this.anchoredTo(x, leftmostPeak);
    },

    adjustedToEndAt(x) {
      return this.anchoredTo(x, rightmostPeak);
    }
  });
}

WavePeaks.none = new WavePeaks([]);

