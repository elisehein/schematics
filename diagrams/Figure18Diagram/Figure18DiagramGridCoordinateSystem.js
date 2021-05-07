import { labelPositions } from "./data.js";

export default class Figure18DiagramGridCoordinateSystem {
  /* Think of the canvas for fig. 18 as a grid:
   *    1 2 3
   *    -----
   * 1| A B C
   * 2| D E F
   * 3| G H I
   * 4| J K L
   *
   * When you reference position [1, 2], that corresponds to D on the grid.
   */
  constructor(
    boxWidth = 50,
    boxHeight = 30,
    arrowWidth = 50,
    arrowHeight = 30,
    canvasWidth = 300,
    canvasHeight = 300) {
    this._boxWidth = boxWidth;
    this._halfBoxWidth = boxWidth / 2;
    this._boxHeight = boxHeight;
    this._halfBoxHeight = boxHeight / 2;
    this._arrowWidth = arrowWidth;
    this._halfArrowWidth = arrowWidth / 2;
    this._arrowHeight = arrowHeight;
    this._halfArrowHeight = arrowHeight / 2;
    this._canvasWidth = canvasWidth;
    this._canvasHeight = canvasHeight;
    this._xOffset = (canvasWidth - (3 * arrowWidth) - (3 * boxWidth)) / 2;
    this._yOffset = (canvasHeight - (4 * arrowHeight) - (4 * boxHeight)) / 2;
  }

  getBoxCoords(position) {
    let startX = this._xOffset + this._halfArrowWidth;
    let xStep = this._boxWidth + this._arrowWidth;
    let startY = this._yOffset + this._halfArrowHeight;
    let yStep = this._boxHeight + this._arrowHeight;

    const x = startX + ((position.x - 1) * xStep);
    const y = startY + ((position.y - 1) * yStep);

    return { x, y };
  }

  getOptionLabelCoords(originBoxCoords, labelPosition, labelSize) {
    const boxOffset = 10;
    const arrowOffset = 5;

    switch (labelPosition) {
      case labelPositions.RIGHT_ABOVE_ARROW:
        return {
          x: originBoxCoords.x + this._boxWidth + boxOffset,
          y: originBoxCoords.y + this._halfBoxHeight - arrowOffset
        };
      case labelPositions.RIGHT_BELOW_ARROW:
        return {
          x: originBoxCoords.x + this._boxWidth + boxOffset,
          // No need for arrow offset along y-axis as the text is positioned at baseline within its bounding box
          y: originBoxCoords.y + this._halfBoxHeight + labelSize.height
        };
      case labelPositions.BOTTOM_LEFT_TO_ARROW:
        return {
          x: originBoxCoords.x + this._halfBoxWidth - labelSize.width - arrowOffset,
          y: originBoxCoords.y + this._boxHeight + boxOffset + 2
        };
      case labelPositions.BOTTOM_RIGHT_TO_ARROW:
        return {
          x: originBoxCoords.x + this._halfBoxWidth + arrowOffset,
          y: originBoxCoords.y + this._boxHeight + boxOffset + 2
        };
      default:
        throw `No such label position: ${labelPosition}.`;
    }
  }

  getArrowCoordinatePoints(originBoxPosition, targetBoxPosition) {
    const originBoxCoords = this.getBoxCoords(originBoxPosition);
    const targetBoxCoords = this.getBoxCoords(targetBoxPosition);

    if (originBoxPosition.equals([3, 1]) && targetBoxPosition.equals([1, 1])) {
      return [
        { x: originBoxCoords.x + this._boxWidth, y: originBoxCoords.y + this._halfBoxHeight },
        { x: originBoxCoords.x + this._boxWidth + this._halfArrowWidth, y: originBoxCoords.y + this._halfBoxHeight },
        { x: originBoxCoords.x + this._boxWidth + this._halfArrowWidth, y: originBoxCoords.y - this._halfArrowHeight },
        { x: targetBoxCoords.x + this._halfBoxWidth, y: targetBoxCoords.y - this._halfArrowHeight },
        { x: targetBoxCoords.x + this._halfBoxWidth, y: targetBoxCoords.y }
      ];
    } else if (originBoxPosition.equals([1, 3]) && targetBoxPosition.equals([3, 1])) {
      return [
        { x: originBoxCoords.x + this._boxWidth, y: originBoxCoords.y + this._halfBoxHeight },
        { x: targetBoxCoords.x + this._halfBoxWidth, y: originBoxCoords.y + this._halfBoxHeight },
        { x: targetBoxCoords.x + this._halfBoxWidth, y: targetBoxCoords.y + this._boxHeight }
      ];
    } else if (originBoxPosition.equals([1, 2]) && targetBoxPosition.equals([2, 1])) {
      return [
        { x: originBoxCoords.x + this._boxWidth, y: originBoxCoords.y + this._halfBoxHeight },
        { x: originBoxCoords.x + this._boxWidth + this._arrowWidth + 5, y: originBoxCoords.y + this._halfBoxHeight },
        { x: originBoxCoords.x + this._boxWidth + this._arrowWidth + 5, y: targetBoxCoords.y + this._boxHeight }
      ];
    } else if (originBoxPosition.equals([2, 1]) && targetBoxPosition.equals([1, 3])) {
      return [
        { x: originBoxCoords.x + this._halfBoxWidth, y: originBoxCoords.y + this._boxHeight },
        { x: originBoxCoords.x + this._halfBoxWidth, y: targetBoxCoords.y + 5 },
        { x: targetBoxCoords.x + this._boxWidth, y: targetBoxCoords.y + 5 }
      ];
    } else {
      return this.getStraightArrowCoordinatePoints(originBoxCoords, targetBoxCoords);
    }
  }

  getStraightArrowCoordinatePoints(originBoxCoords, targetBoxCoords) {
    // Taking advantage of the fact that we KNOW the data is limited
    // to arrows that go straight down or straight right.
    if (originBoxCoords.x == targetBoxCoords.x) {
      const x = originBoxCoords.x + this._halfBoxWidth;
      return [
        { x: x, y: originBoxCoords.y + this._boxHeight },
        { x: x, y: targetBoxCoords.y - 1 }
      ];
    } else {
      const y = originBoxCoords.y + this._halfBoxHeight;
      return [
        { x: originBoxCoords.x + this._boxWidth, y: y },
        { x: targetBoxCoords.x - 1, y: y }
      ];
    }
  }
}

export class Figure18DiagramGridPosition {
  constructor(x, y) {
    this._x = x;
    this._y = y;
  }

  equals(positionArray) {
    return positionArray[0] == this.x && positionArray[1] == this.y;
  }

  toString() {
    return `${this.x}${this.y}`;
  }

  get x() {
    return this._x;
  }

  get y() {
    return this._y;
  }
}