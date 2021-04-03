import Figure from "./Figure.js";
import { Line, BoxedText, Text } from "./SVGShape.js";

const boxWidth = 50;
const boxHeight = 30;
const arrowWidth = 50;
const arrowHeight = 30;

const labelPositions = {
  RIGHT_ABOVE_ARROW: "RIGHT_ABOVE_ARROW",
  RIGHT_BELOW_ARROW: "RIGHT_BELOW_ARROW",
  BOTTOM_LEFT_TO_ARROW: "BOTTOM_LEFT_TO_ARROW",
  BOTTOM_RIGHT_TO_ARROW: "BOTTOM_RIGHT_TO_ARROW",
}

const flowChart = {
  "good?": {
    position: [1, 1],
    options: [
      { label: "yes", to: "more?", labelPosition: labelPositions.RIGHT_ABOVE_ARROW },
      { label: "no", to: "fix it?", labelPosition: labelPositions.BOTTOM_LEFT_TO_ARROW }
    ],
  },
  "fix it?": {
    position: [1, 2],
    options: [
      { label: "yes", to: "more?", labelPosition: labelPositions.RIGHT_ABOVE_ARROW },
      { label: "no", to: "stopit.", labelPosition: labelPositions.BOTTOM_LEFT_TO_ARROW }
    ],
  },
  "stopit.": {
    position: [1, 3],
    options: [
      { label: "OK", to: "good.", labelPosition: labelPositions.BOTTOM_LEFT_TO_ARROW },
      { label: "no", to: "do it.", labelPosition: labelPositions.RIGHT_BELOW_ARROW }
    ]
  },
  "good.": {
    position: [1, 4]
  },
  "more?": {
    position: [2, 1],
    options: [
      { label: "yes", to: "do it.", labelPosition: labelPositions.RIGHT_ABOVE_ARROW },
      { label: "no", to: "stopit.", labelPosition: labelPositions.BOTTOM_RIGHT_TO_ARROW }
     ]
  },
  "do it.": {
    position: [3, 1],
    options: [
      { label: "", to: "good?" }
    ]
  }
}

const firstBox = "good?";

export default class Figure18 extends Figure {
  constructor() {
    super(18);
  }

  animate() {
    this.drawBoxWithOptions(firstBox);
  }

  drawBoxWithOptions(boxText) {
    const boxData = flowChart[boxText];

    if (this.boxWithOptionsExists(boxData.position)) {
      console.log(boxText, "already exists, not drawing again.");
      return;
    }

    this.drawBoxedText({
      text: boxText,
      position: boxData.position,
      onDone: () => {
        this.drawOptions(boxData.position, boxData.options);
      }
    });
  }

  boxPositionToID(position) {
    return position.toString().split(",").join("")
  }

  boxWithOptionsExists(position) {
    return this.querySelector(`#box-${this.boxPositionToID(position)}`) !== null;
  }

  drawOptions(originBoxPosition, options) {
    options.forEach(this.drawOption.bind(this, originBoxPosition));
  }

  drawOption(originBoxPosition, option, index) {
    setTimeout(() => {
      this.drawOptionLabel(originBoxPosition, option);
    }, 700 + (index * 400));
  }

  drawOptionLabel(originBoxPosition, option) {
    // Set zero origin to just get the text height at first, override coords later.
    const label = new Text(option.label, { x: 0, y: 0 }, 8);
    label.node.classList.add("option-label", "option-label--active");

    this.addSVGChildElement(label.node);

    this.adjustOptionLabelCoords(
      label.node,
      this.getBoxCoords(originBoxPosition),
      option.labelPosition
    );

    this.removeBlurOnAnimationEnd(label.node);
    label.node.classList.add("skew-appear");
    this.bindOptionLabelClick(label.node, option.to);
  }

  bindOptionLabelClick(labelNode, targetBoxText) {
    labelNode.addEventListener("click", () => {
      labelNode.classList.remove("option-label--active");
      this.drawOptionArrow({
        onDone: () => this.drawBoxWithOptions(targetBoxText)
      });
    }, { once: true });
  }

  adjustOptionLabelCoords(labelNode, originBoxCoords, labelPosition) {
    const labelSize = labelNode.getBBox();

    const labelCoords = this.getOptionLabelCoords(
      originBoxCoords,
      labelPosition,
      labelSize
    );

    labelNode.setAttribute("x", labelCoords.x);
    labelNode.setAttribute("y", labelCoords.y);
    labelNode.setAttribute(
      "transform-origin",
      `${labelCoords.x + (labelSize.width / 2)} ${labelCoords.y + (labelSize.height / 2)}`
    );
  }

  getOptionLabelCoords(originBoxCoords, labelPosition, labelSize) {
    const boxOffset = 10;
    const arrowOffset = 3;

    switch (labelPosition) {
      case labelPositions.RIGHT_ABOVE_ARROW:
        return {
          x: originBoxCoords.x + boxWidth + boxOffset,
          y: originBoxCoords.y + (boxHeight / 2) - labelSize.height + 3
        };
      case labelPositions.RIGHT_BELOW_ARROW:
        return {
          x: originBoxCoords.x + boxWidth + boxOffset,
          y: originBoxCoords.y + (boxHeight / 2) + arrowOffset
        };
      case labelPositions.BOTTOM_LEFT_TO_ARROW:
        return {
          x: originBoxCoords.x + (boxWidth / 2) - labelSize.width - arrowOffset,
          y: originBoxCoords.y + boxHeight + boxOffset + 2
        };
      case labelPositions.BOTTOM_RIGHT_TO_ARROW:
        return {
          x: originBoxCoords.x + (boxWidth / 2) + arrowOffset,
          y: originBoxCoords.y + boxHeight + boxOffset + 2
        };
      default:
        throw `No such label position: ${labelPosition}.`;
    }
  }

  drawOptionArrow({ onDone }) {
    // TODO
    onDone();
  }

  drawBoxedText({ text, position, onDone }) {
    const boxSize = { width: 50, height: 30 };
    const coords = this.getBoxCoords(position);
    const fontSize = 8;

    const boxedText = new BoxedText(text, fontSize, coords, boxSize);
    boxedText.node.classList.add("skew-appear");
    boxedText.node.setAttribute("id", `box-${this.boxPositionToID(position)}`);
    boxedText.node.setAttribute(
      "transform-origin",
      `${coords.x + (boxSize.width / 2)} ${coords.y + (boxSize.height / 2)}`
    );
    this.addSVGChildElement(boxedText.node);
    this.removeBlurOnAnimationEnd(boxedText.node);

    boxedText.node.addEventListener("animationend", onDone);
  }

  getBoxCoords(position) {
    let startX = 25;
    let xStep = boxWidth + arrowWidth;
    let startY = 45;
    let yStep = boxHeight + arrowHeight;

    const x = startX + ((position[0] - 1) * xStep);
    const y = startY + ((position[1] - 1) * yStep);

    return { x, y };
  }

  removeBlurOnAnimationEnd(node) {
    node.addEventListener("animationend", () => {
      node.style.filter = "none";
    }, { once: true });
  }
}

customElements.define("figure-18", Figure18);