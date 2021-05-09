import { Figure18DiagramGridPosition } from "./Figure18DiagramGridCoordinateSystem.js";

export const labelPositions = {
  RIGHT_ABOVE_ARROW: "RIGHT_ABOVE_ARROW",
  RIGHT_BELOW_ARROW: "RIGHT_BELOW_ARROW",
  BOTTOM_LEFT_TO_ARROW: "BOTTOM_LEFT_TO_ARROW",
  BOTTOM_RIGHT_TO_ARROW: "BOTTOM_RIGHT_TO_ARROW"
}

const flowChartData = {
  "good?": {
    position: new Figure18DiagramGridPosition(1, 1),
    options: [
      { label: "yes", to: "more?", labelPosition: labelPositions.RIGHT_ABOVE_ARROW },
      { label: "no", to: "fix it?", labelPosition: labelPositions.BOTTOM_LEFT_TO_ARROW }
    ]
  },
  "fix it?": {
    position: new Figure18DiagramGridPosition(1, 2),
    options: [
      { label: "yes", to: "more?", labelPosition: labelPositions.RIGHT_ABOVE_ARROW },
      { label: "no", to: "stopit.", labelPosition: labelPositions.BOTTOM_LEFT_TO_ARROW }
    ]
  },
  "stopit.": {
    position: new Figure18DiagramGridPosition(1, 3),
    options: [
      { label: "OK", to: "good.", labelPosition: labelPositions.BOTTOM_LEFT_TO_ARROW },
      { label: "no", to: "do it.", labelPosition: labelPositions.RIGHT_BELOW_ARROW }
    ]
  },
  "good.": {
    position: new Figure18DiagramGridPosition(1, 4)
  },
  "more?": {
    position: new Figure18DiagramGridPosition(2, 1),
    options: [
      { label: "yes", to: "do it.", labelPosition: labelPositions.RIGHT_ABOVE_ARROW },
      { label: "no", to: "stopit.", labelPosition: labelPositions.BOTTOM_RIGHT_TO_ARROW }
     ]
  },
  "do it.": {
    position: new Figure18DiagramGridPosition(3, 1),
    options: [
      { label: "", to: "good?" }
    ]
  }
}

export default flowChartData;
