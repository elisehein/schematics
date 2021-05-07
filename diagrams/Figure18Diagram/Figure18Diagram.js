import Diagram from "../Diagram.js";
import data from "./data.js";
import Figure18DiagramGridCoordinateSystem from "./Figure18DiagramGridCoordinateSystem.js";
import { Line, BoxedText, Text } from "../svgShapes.js";

const firstBox = "good?";

export default class Figure18Diagram extends Diagram {
  constructor() {
    super(18);
    this._grid = new Figure18DiagramGridCoordinateSystem();
  }

  draw() {
    this.drawBoxWithOptions(firstBox);
  }

  drawBoxWithOptions(boxText) {
    const boxData = data[boxText];

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

  boxWithOptionsExists(position) {
    return this.querySelector(`#box-${position.toString()}`) !== null;
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
    const originBoxCoords = this._grid.getBoxCoords(data[originBoxText].position);
    const { x, y } = this._grid.getOptionLabelCoords(originBoxCoords, option.labelPosition, labelSize);

    label.node.setAttribute("x", x);
    label.node.setAttribute("y", y);
    label.node.setAttribute(
      "transform-origin",
      `${x + (labelSize.width / 2)} ${y + (labelSize.height / 2)}`
    );

    this.drawOptionLabelUnderline(x, y, labelSize);
    this.bindOptionLabelClick(label.node, originBoxText, option);
  }

  drawOptionLabelUnderline(labelX, labelY, labelSize) {
    const underline = new Line(
      { x: labelX - 1, y: labelY + 3 },
      { x: labelX + labelSize.width + 1, y: labelY + 3 }
    );
    underline.node.classList.add("option-label-underline");
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

  drawOptionArrow({ originBoxText, option, onDone }) {
    const originPosition = data[originBoxText].position;
    const targetPosition = data[option.to].position;
    const arrowPoints = this._grid.getArrowCoordinatePoints(originPosition, targetPosition);
    const arrowLine = new Line(...arrowPoints);
    arrowLine.node.classList.add("arrow");

    this.addSVGChildElement(arrowLine.node);
    arrowLine.node.classList.add("option-arrow");

    this.style.setProperty("--animatable-line-length", arrowLine.getLength());

    arrowLine.node.addEventListener("animationend", () => {
      arrowLine.addArrowHead(this.registerMarker.bind(this));
      onDone();
    })
  }

  drawBoxedText({ text, position, onDone }) {
    const boxSize = { width: 50, height: 30 };
    const coords = this._grid.getBoxCoords(position);
    const fontSize = 8;

    const boxedText = new BoxedText(text, fontSize, coords, boxSize);
    boxedText.node.classList.add("boxed-text");
    boxedText.node.setAttribute("id", `box-${position.toString()}`);

    this.addSVGChildElement(boxedText.node);
    onDone();
    // boxedText.node.addEventListener("animationend", onDone);
  }
}

customElements.define("figure-18-diagram", Figure18Diagram);