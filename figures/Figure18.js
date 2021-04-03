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
        this.drawOptions(boxText, boxData.options);
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
    options.forEach(this.drawOption.bind(this, originBoxText));
  }

  drawOption(originBoxText, option, index) {
    setTimeout(() => {
      this.drawOptionLabel(originBoxText, option);
    }, 700 + (index * 400));
  }

  drawOptionLabel(originBoxText, option) {
    // Set zero origin to just get the text height at first, override coords later.
    const label = new Text(option.label, { x: 0, y: 0 }, 8);
    label.node.classList.add("option-label", "option-label--active");

    this.addSVGChildElement(label.node);

    this.adjustOptionLabelCoords(
      label.node,
      this.getBoxCoords(flowChart[originBoxText].position),
      option.labelPosition
    );

    this.removeBlurOnAnimationEnd(label.node);
    label.node.classList.add("skew-appear");
    this.bindOptionLabelClick(label.node, originBoxText, option);
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

  drawOptionArrow({ originBoxText, option, onDone }) {
    if (option.label == "" && option.to == "good?") {
      onDone();
      return;
    }

    if (option.label == "no" && option.to == "do it.") {
      onDone();
      return;
    }

    if (originBoxText == "fix it?" && option.label == "yes") {
      onDone();
      return;
    }

    if (originBoxText == "more?" && option.label == "no") {
      onDone();
      return;
    }

    this.drawStraightArrow({
      originBoxPosition: flowChart[originBoxText].position,
      targetBoxPosition: flowChart[option.to].position,
      onDone: onDone
    });
  }

  drawStraightArrow({ originBoxPosition, targetBoxPosition, onDone }) {
    const originCoords = this.getBoxCoords(originBoxPosition);
    const targetCoords = this.getBoxCoords(targetBoxPosition);
    let startCoords, endCoords;

    // Taking advantage of the fact that we KNOW the data is limited
    // to arrows that go straight down or straight right.
    if (originCoords.x == targetCoords.x) {
      const x = originCoords.x + (boxWidth / 2);
      startCoords = { x: x, y: originCoords.y + boxHeight }
      endCoords = { x: x, y: targetCoords.y - 1 }
    } else {
      const y = originCoords.y + (boxHeight / 2);
      startCoords = { x: originCoords.x + boxWidth, y: y }
      endCoords = { x: targetCoords.x - 1, y: y }
    }

    const line = new Line(startCoords, endCoords);
    this.addSVGChildElement(line.node);
    this.style.setProperty("--animatable-line-length", line.length);
    line.node.addEventListener("animationend", () => {
      line.node.setAttribute("marker-end", `url(#arrowhead-marker)`);
      onDone();
    })
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