import { SVGDiagram } from "./Diagram.js";
import BezierEasing from "../../helpers/BezierEasing.js";
import Duration from "../../helpers/Duration.js";

export default class Figure20Diagram extends SVGDiagram {
  constructor(...args) {
    super(20, ...args);

    this._numberOfRows = 7;
    this._numberOfGaps = this._numberOfRows - 1;
    this._barGap = 10;
    this._barsPerRow = 200;
    this._verticalInset = 15;
    this._waveWidth = 70;

    const rowToRowGapRatio = 0.8;
    const height = 300 - (2 * this._verticalInset);
    this._rowGap =  height / (this._numberOfRows * rowToRowGapRatio + this._numberOfGaps);
    this._rowHeight = this._rowGap * rowToRowGapRatio;

    this._translationAmountsFromWaveCenter = generateTranslationAmountsFromWaveCenter(1.2, this._barGap, this._barsPerRow - 1);
  }

  drawThumbnail() {
  }

  drawBeforeCaption({ onDone }) {
    // onDone();
    this._bars = this.drawBars();

    // this.addWaves({ waveCenters: [0], rowBars: this._bars[0] });
    // this.addWaves({ waveCenters: [40], rowBars: this._bars[1] });
    this.addWaves({ waveCenters: [0, 70], rowBars: this._bars[2] });
    // this.addWaves({ waveCenters: [40, 125], rowBars: this._bars[3] });
    // this.addWaves({ waveCenters: [0, 85, 170], rowBars: this._bars[4] });
    // this.addWaves({ waveCenters: [40, 125, 210], rowBars: this._bars[5] });
    // this.addWaves({ waveCenters: [0, 85, 170, 255], rowBars: this._bars[6] });
  }

  drawAfterCaption({ onLightUp }) {
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
    let x;

    // Draw half the bars to the left of the midpoint, and the other half to the right,
    // creating overflow on both sides, keeping bars ordered from left to right.
    if (barIndex < this._barsPerRow / 2) {
      const leftMostBarX = this._barsPerRow / 2 * this._barGap;
      x = 150 - leftMostBarX + (barIndex * this._barGap);
    } else {
      const adjustedIndex = barIndex - this._barsPerRow / 2;
      x = 150 + (adjustedIndex * this._barGap);
    }

    const lineTopPoint = { x, y: topY };
    const lineBottomPoint = { x, y: bottomY };
    const bar = this._svgShapeFactory.getLine(lineTopPoint, lineBottomPoint);
    bar.stroke();
    bar.node.style.strokeLinecap = "unset";
    return bar;
  }

  addWaves({ waveCenters, rowBars }) {
    waveCenters.forEach(x => {
      const waveCenterBarIndex = this.getClosestBarIndex(x, rowBars);
      rowBars[waveCenterBarIndex].node.style.stroke = "red";

      this.pullBarsCloser({ waveCenterBarIndex, direction: 1, bars: rowBars });
      this.pullBarsCloser({ waveCenterBarIndex, direction: -1, bars: rowBars });
    });
  }

  pullBarsCloser({ waveCenterBarIndex, direction, bars }) {
    let nextIndex = waveCenterBarIndex + direction;
    while (nextIndex >= 0 && nextIndex < bars.length) {
      this.adjustPositionRelativeToWaveCenterBar({
        bars,
        indexOfBarToAdjust: nextIndex,
        waveCenterBarIndex,
        direction
      });
      nextIndex += direction;
    }
  }

  adjustPositionRelativeToWaveCenterBar({ bars, indexOfBarToAdjust, waveCenterBarIndex, direction }) {
    const barNode = bars[indexOfBarToAdjust].node;
    const currentXTranslation = parseFloat(barNode.dataset.xTranslation) || 0;

    const barsFromWaveCenter = Math.abs(indexOfBarToAdjust - waveCenterBarIndex);
    const translationAmount = this._translationAmountsFromWaveCenter[barsFromWaveCenter - 1];
    const newXTranslation = currentXTranslation - (translationAmount * direction);

    barNode.setAttribute("transform", `translate(${newXTranslation} 0)`);
    barNode.dataset.xTranslation = newXTranslation;
  }

  /* Need to take into account translation here! */
  getClosestBarIndex(x, bars) {
    console.log("\nGetting closest bar index to", x, "in bars", bars);

    const xs = bars.map((bar, index) => ({
        x: this.parseXCoord(bar.node.getAttribute("points")) + (parseFloat(bar.node.dataset.xTranslation) || 0),
        index
      }));

    console.log("All the xs are", xs);

    const index = xs.reduce((prevBar, currBar) => (
        Math.abs(currBar.x - x) < Math.abs(prevBar.x - x) ? currBar : prevBar
      )).index;
      console.log("closes index is", index);
      return index;
  }

  parseXCoord(points) {
    // Everything until the first comma is the X coordinate
    // e.g., "140,30 140,60", x = 140
    return parseFloat(points.match(/([^,]*)/)[0]);
  }

}

customElements.define("figure-20-diagram", Figure20Diagram);

// These translation amounts never change, so calculate them
// once instead of for every bar whenever we change a wave
function generateTranslationAmountsFromWaveCenter(scaleFactor, barGap, maxDistanceFromWaveCenter) {
  const getDistanceFromWaveCenter = generateBarDistancesFromWaveCenter(scaleFactor, barGap);

  return Array(maxDistanceFromWaveCenter)
    .fill()
    .map((_, index) => {
      const distanceFromWaveCenter = getDistanceFromWaveCenter(index + 1);
      const distanceBetweenBars = (index + 1) * barGap;
      return (distanceBetweenBars - distanceFromWaveCenter);
    });
}

function generateBarDistancesFromWaveCenter(scaleFactor, barGap) {
  const getDistances = (distancesSoFar = [1.5]) => {
    const length = distancesSoFar.length;
    const previousDistance = length > 1 ? distancesSoFar[length - 2] : 0;
    const currentDistance = distancesSoFar[length - 1];
    const nextDistance = scaleDistance(currentDistance, previousDistance, scaleFactor);

    if (nextDistance - currentDistance < barGap) {
      const newDistances = [...distancesSoFar, nextDistance];
      return getDistances(newDistances);
    } else {
      return distancesSoFar;
    }
  };

  const distances = getDistances();

  return barDistance => {
    if (barDistance > distances.length) {
      return distances[distances.length - 1] + ((barDistance - distances.length) * barGap);
    } else {
      return distances[barDistance - 1];
    }
  };
}

function scaleDistance(distance, previousDistance, scaleFactor) {
  const differenceBetweenDistances = distance - previousDistance;
  const scaledDifference = differenceBetweenDistances * scaleFactor;
  return distance + scaledDifference;
}
