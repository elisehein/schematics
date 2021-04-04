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
        if (boxData.options) {
          this.drawOptions(boxText, boxData.options);
        }
      }
    });
  }

  boxPositionToID(position) {
    return position.toString().split(",").join("")
  }

  boxWithOptionsExists(position) {
    return this.querySelector(`#box-${this.boxPositionToID(position)}`) !== null;
  }

  drawOptions(originBoxText, options) {
    options.forEach((option, index) => {
      if (option.label == "") {
        this.drawOptionArrow({ originBoxText, option, onDone: () => {}});
      } else {
        setTimeout(() => {
          this.drawOptionLabel(originBoxText, option);
        }, 700 + (index * 400));
      }
    });
  }

  drawOptionLabel(originBoxText, option) {
    // Set zero origin to just get the text size at first, override coords later.
    const label = new Text(option.label, { x: 0, y: 0 }, 8);
    label.node.classList.add("option-label", "option-label--active");

    this.addSVGChildElement(label.node);

    const labelSize = label.node.getBBox();
    const originBoxCoords = this.getBoxCoords(flowChart[originBoxText].position);
    const { x, y } = this.getOptionLabelCoords(originBoxCoords, option.labelPosition, labelSize);

    label.node.setAttribute("x", x);
    label.node.setAttribute("y", y);
    label.node.setAttribute(
      "transform-origin",
      `${x + (labelSize.width / 2)} ${y + (labelSize.height / 2)}`
    );

    this.drawOptionLabelUnderline(x, y, labelSize);
    this.removeBlurOnAnimationEnd(label.node);
    label.node.classList.add("skew-appear");
    this.bindOptionLabelClick(label.node, originBoxText, option);
  }

  drawOptionLabelUnderline(labelX, labelY, labelSize) {
    const underline = new Line(
      { x: labelX - 1, y: labelY + 3 },
      { x: labelX + labelSize.width + 1, y: labelY + 3 }
    );
    underline.node.classList.add("option-label-underline", "skew-appear");
    this.removeBlurOnAnimationEnd(underline.node);
    this.addSVGChildElement(underline.node);
  }

  bindOptionLabelClick(labelNode, originBoxText, targetOption) {
    labelNode.addEventListener("click", () => {
      labelNode.classList.remove("option-label--active");
      this.drawOptionArrow({
        originBoxText: originBoxText,
        option: targetOption,
        onDone: () => this.drawBoxWithOptions(targetOption.to)
      });
    }, { once: true });
  }

  getOptionLabelCoords(originBoxCoords, labelPosition, labelSize) {
    const boxOffset = 10;
    const arrowOffset = 5;

    switch (labelPosition) {
      case labelPositions.RIGHT_ABOVE_ARROW:
        return {
          x: originBoxCoords.x + boxWidth + boxOffset,
          y: originBoxCoords.y + (boxHeight / 2) - arrowOffset
        };
      case labelPositions.RIGHT_BELOW_ARROW:
        return {
          x: originBoxCoords.x + boxWidth + boxOffset,
          // No need for arrow offset along y-axis as the text is positioned at baseline within its bounding box
          y: originBoxCoords.y + (boxHeight / 2) + labelSize.height
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

  drawOptionArrow({ originBoxText, option, onDone }) {
    let arrowLine;

    const originBoxCoords = this.getBoxCoords(flowChart[originBoxText].position);
    const targetBoxCoords = this.getBoxCoords(flowChart[option.to].position);

    if (option.label == "" && option.to == "good?") {
      arrowLine = new Line(
        { x: originBoxCoords.x + boxWidth, y: originBoxCoords.y + (boxHeight / 2) },
        { x: originBoxCoords.x + boxWidth + (arrowWidth / 2), y: originBoxCoords.y + (boxHeight / 2) },
        { x: originBoxCoords.x + boxWidth + (arrowWidth / 2), y: originBoxCoords.y - (arrowHeight / 2) },
        { x: targetBoxCoords.x + (boxWidth / 2), y: targetBoxCoords.y - (arrowHeight / 2) },
        { x: targetBoxCoords.x + (boxWidth / 2), y: targetBoxCoords.y }
      );
    } else if (option.label == "no" && option.to == "do it.") {
      arrowLine = new Line(
        { x: originBoxCoords.x + boxWidth, y: originBoxCoords.y + (boxHeight / 2) },
        { x: targetBoxCoords.x + (boxWidth / 2), y: originBoxCoords.y + (boxHeight / 2) },
        { x: targetBoxCoords.x + (boxWidth / 2), y: targetBoxCoords.y + boxHeight }
      );
    } else if (originBoxText == "fix it?" && option.label == "yes") {
      arrowLine = new Line(
        { x: originBoxCoords.x + boxWidth, y: originBoxCoords.y + (boxHeight / 2) },
        { x: originBoxCoords.x + boxWidth + arrowWidth + 5, y: originBoxCoords.y + (boxHeight / 2) },
        { x: originBoxCoords.x + boxWidth + arrowWidth + 5, y: targetBoxCoords.y + boxHeight }
      );
    } else if (originBoxText == "more?" && option.label == "no") {
      arrowLine = new Line(
        { x: originBoxCoords.x + (boxWidth / 2), y: originBoxCoords.y + boxHeight },
        { x: originBoxCoords.x + (boxWidth / 2), y: targetBoxCoords.y + 5 },
        { x: targetBoxCoords.x + boxWidth, y: targetBoxCoords.y + 5 }
      );
    } else {
      arrowLine = this.getStraightLine(originBoxCoords, targetBoxCoords);
    }

    this.addSVGChildElement(arrowLine.node);
    this.style.setProperty("--animatable-line-length", arrowLine.length);
    arrowLine.node.classList.add("option-arrow");
    arrowLine.node.addEventListener("animationend", () => {
      arrowLine.addArrowHead();
      onDone();
    })
  }

  getStraightLine(originBoxCoords, targetBoxCoords) {
    let startCoords, endCoords;

    // Taking advantage of the fact that we KNOW the data is limited
    // to arrows that go straight down or straight right.
    if (originBoxCoords.x == targetBoxCoords.x) {
      const x = originBoxCoords.x + (boxWidth / 2);
      startCoords = { x: x, y: originBoxCoords.y + boxHeight }
      endCoords = { x: x, y: targetBoxCoords.y - 1 }
    } else {
      const y = originBoxCoords.y + (boxHeight / 2);
      startCoords = { x: originBoxCoords.x + boxWidth, y: y }
      endCoords = { x: targetBoxCoords.x - 1, y: y }
    }

    return new Line(startCoords, endCoords);
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