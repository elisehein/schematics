import { Figure18DiagramGridPosition } from "./Figure18DiagramGridCoordinateSystem.js";

export const labelPositions = {
  RIGHT_ABOVE_ARROW: "RIGHT_ABOVE_ARROW",
  RIGHT_BELOW_ARROW: "RIGHT_BELOW_ARROW",
  BOTTOM_LEFT_TO_ARROW: "BOTTOM_LEFT_TO_ARROW",
  BOTTOM_RIGHT_TO_ARROW: "BOTTOM_RIGHT_TO_ARROW"
}

export const targetSideTouchPoints = {
  TOP_SIDE_MIDDLE: "TOP_SIDE_MIDDLE",
  BOTTOM_SIDE_MIDDLE: "BOTTOM_SIDE_MIDDLE",
  BOTTOM_SIDE_LEFT: "BOTTOM_SIDE_LEFT",
  LEFT_SIDE_MIDDLE: "LEFT_SIDE_MIDDLE",
  RIGHT_SIDE_TOP: "RIGHT_SIDE_TOP"
}

const flowChartData = {
  "good?": {
    position: new Figure18DiagramGridPosition(1, 1),
    options: [{
      label: "yes",
      target: "more?",
      labelPosition: labelPositions.RIGHT_ABOVE_ARROW,
      touchPoint: targetSideTouchPoints.LEFT_SIDE_MIDDLE
    }, {
      label: "no",
      target: "fix it?",
      labelPosition: labelPositions.BOTTOM_LEFT_TO_ARROW,
      touchPoint: targetSideTouchPoints.TOP_SIDE_MIDDLE
    }]
  },
  "fix it?": {
    position: new Figure18DiagramGridPosition(1, 2),
    options: [{
      label: "yes",
      target: "more?",
      labelPosition: labelPositions.RIGHT_ABOVE_ARROW,
      touchPoint: targetSideTouchPoints.BOTTOM_SIDE_LEFT
    }, {
      label: "no",
      target: "stopit.",
      labelPosition: labelPositions.BOTTOM_LEFT_TO_ARROW,
      touchPoint: targetSideTouchPoints.RIGHT_SIDE_TOP
   }]
  },
  "stopit.": {
    position: new Figure18DiagramGridPosition(1, 3),
    options: [{
      label: "OK",
      target: "good.",
      labelPosition: labelPositions.BOTTOM_LEFT_TO_ARROW,
      touchPoint: targetSideTouchPoints.TOP_SIDE_MIDDLE
    }, {
      label: "no",
      target: "do it.",
      labelPosition: labelPositions.RIGHT_BELOW_ARROW,
      touchPoint: targetSideTouchPoints.BOTTOM_SIDE_MIDDLE
    }]
  },
  "good.": {
    position: new Figure18DiagramGridPosition(1, 4)
  },
  "more?": {
    position: new Figure18DiagramGridPosition(2, 1),
    options: [{
      label: "yes",
      target: "do it.",
      labelPosition: labelPositions.RIGHT_ABOVE_ARROW,
      touchPoint: targetSideTouchPoints.LEFT_SIDE_MIDDLE
    }, {
      label: "no",
      target: "stopit.",
      labelPosition: labelPositions.BOTTOM_RIGHT_TO_ARROW,
      touchPoint: targetSideTouchPoints.TOP_SIDE_MIDDLEID
    }]
  },
  "do it.": {
    position: new Figure18DiagramGridPosition(3, 1),
    options: [
      { label: "", target: "good?", touchPoint: targetSideTouchPoints.TOP_SIDE_MIDDLE }
    ]
  }
}

export default flowChartData;
