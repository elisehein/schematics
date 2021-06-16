import { SVGDiagram } from "./Diagram.js";
import BezierEasing from "../../helpers/BezierEasing.js";
import Duration from "../../helpers/Duration.js";

export default class Figure20Diagram extends SVGDiagram {
  constructor(...args) {
    super(20, ...args);

    this._numberOfRows = 7;
    this._barSpacing = 9;
    this._barsPerRow = 200;
    this._verticalInset = 30;
    this._waveWidth = 300 / 3.5;

    this._rowHeight = (
      300 -
      (2 * this._verticalInset)
    ) / (this._numberOfRows * 2 - 1);
    this._rowSpacing = this._rowHeight;

    this._getDistanceFromWaveCenter = generateBarDistancesFromWaveCenter(1.5, this._barSpacing);
  }

  drawThumbnail() {
  }

  drawBeforeCaption({ onDone }) {
    // onDone();
    this._bars = this.drawBars();

    this.addWaves({ n: 1, cx: 150, rowBars: this._bars[0] });
    // this.addWaves({ n: 1, cx: this._waveWidth / 2, row: this._bars[1] });
    // this.addWaves({ n: 2, cx: this._waveWidth, row: this._bars[2] });
    // this.addWaves({ n: 2, cx: this._waveWidth * 2, row: this._bars[3] });
    // this.addWaves({ n: 3, cx: this._waveWidth * 2.5, row: this._bars[4] });
    // this.addWaves({ n: 3, cx: this._waveWidth * 4.5, row: this._bars[5] });
    // this.addWaves({ n: 6, cx: this._waveWidth * 6, row: this._bars[6] });
  }

  drawAfterCaption({ onLightUp }) {
  }

  drawBars() {
    const bars = [];

    for (let rowIndex = 0; rowIndex < this._numberOfRows; rowIndex += 1) {
      const barsForRow = [];
      const groupNode = this._svgShapeFactory.getGroupNode();
      groupNode.dataset.rowIndex = rowIndex;

      const topY = this._verticalInset + (rowIndex * (this._rowHeight + this._rowSpacing));
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
      const leftMostBarX = this._barsPerRow / 2 * this._barSpacing;
      x = 150 - leftMostBarX + (barIndex * this._barSpacing);
    } else {
      const adjustedIndex = barIndex - this._barsPerRow / 2;
      x = 150 + (adjustedIndex * this._barSpacing);
    }

    const lineTopPoint = { x, y: topY };
    const lineBottomPoint = { x, y: bottomY };
    const bar = this._svgShapeFactory.getLine(lineTopPoint, lineBottomPoint);
    bar.stroke();
    bar.node.style.strokeLinecap = "unset";
    return bar;
  }

  addWaves({ n, cx, rowBars }) {
    const waveCenterBarIndex = this.getClosestBarIndex(cx, rowBars);
    // rowBars[waveCenterBarIndex].node.style.stroke = "red";

    this.pullBarsCloser({ waveCenterBarIndex, direction: 1, bars: rowBars });
    this.pullBarsCloser({ waveCenterBarIndex, direction: -1, bars: rowBars });
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
    const newXTranslation = currentXTranslation + this.getTranslationAmount(barsFromWaveCenter, direction);

    barNode.setAttribute("transform", `translate(${newXTranslation} 0)`);
    barNode.dataset.xTranslation = newXTranslation;
  }

  getTranslationAmount(barsFromWaveCenter, direction) {
    const distanceFromWaveCenter = this._getDistanceFromWaveCenter(barsFromWaveCenter);
    const distanceBetweenBars = barsFromWaveCenter * this._barSpacing;
    return (distanceBetweenBars - distanceFromWaveCenter) * direction * -1;
  }

  getClosestBarIndex(x, bars) {
    return bars.findIndex((bar, index) => {
      const barX = this.parseXCoord(bar.node.getAttribute("points"));

      if (index + 1 < bars.length) {
        const nextBarX = this.parseXCoord(bars[index + 1].node.getAttribute("points"));
        return x >= barX && x <= nextBarX;
      } else {
        return x >= barX;
      }
    });
  }

  parseXCoord(points) {
    // Everything until the first comma is the X coordinate
    // e.g., "140,30 140,60", x = 140
    return parseFloat(points.match(/([^,]*)/)[0]);
  }

}

customElements.define("figure-20-diagram", Figure20Diagram);

function generateBarDistancesFromWaveCenter(scaleFactor, barSpacing) {
  const getDistances = (distancesSoFar = [1]) => {
    const currentDistance = distancesSoFar[distancesSoFar.length - 1];
    const nextDistance = currentDistance * scaleFactor;
    if (nextDistance - currentDistance < barSpacing) {
      const newDistances = [...distancesSoFar, nextDistance];
      return getDistances(newDistances);
    } else {
      return distancesSoFar;
    }
  };

  const distances = getDistances();

  return barDistance => {
    if (barDistance > distances.length) {
      return distances[distances.length - 1] + ((barDistance - distances.length) * barSpacing);
    } else {
      return distances[barDistance - 1];
    }
  };
}
