/* eslint-disable id-length */
import Diagram from "../Diagram.js";
import data from "./data.js";
import Figure18DiagramGridCoordinateSystem from "./Figure18DiagramGridCoordinateSystem.js";
import { Line, BoxedText, Text } from "../../SVGShapes/SVGShapes.js";

const firstBox = "good?";

export default class Figure18Diagram extends Diagram {
  constructor() {
    super(18);
    this._grid = new Figure18DiagramGridCoordinateSystem();
  }

  draw() {
    this.drawBoxWithOptions(firstBox, false);
  }

  drawBoxWithOptions(boxText, animated = true) {
    const boxData = data[boxText];

    if (this.boxWithOptionsExists(boxData.position)) {
      console.log(boxText, "already exists, not drawing again.");
      return;
    }

    this.drawBoxedText({
      text: boxText,
      position: boxData.position,
      animated,
      onDone: () => {
        if (boxData.options) {
          this.drawOptions(boxText, boxData.options, animated);
        }
      }
    });
  }

  boxWithOptionsExists(position) {
    return this.querySelector(`#box-${position.toString()}`) !== null;
  }

  drawOptions(originBoxText, options, animated = true) {
    options.forEach((option, index) => {
      if (option.label == "") {
        this.drawOptionArrow({ originBoxText, option, onDone: () => {} });
      } else if (animated) {
        setTimeout(() => {
          this.drawOptionLabel(originBoxText, option);
        }, 700 + (index * 400));
      } else {
        this.drawOptionLabel(originBoxText, option);
      }
    });
  }

  drawOptionLabel(originBoxText, option) {
    // Set zero origin to just get the text size at first, override coords later.
    const label = new Text(option.label, { x: 0, y: 0 }, 8);

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
    label.node.style.cursor = "pointer";

    const underline = this.drawOptionLabelUnderline(x, y, labelSize);
    this.bindOptionLabelClick(label.node, underline.node, originBoxText, option);
  }

  drawOptionLabelUnderline(labelX, labelY, labelSize) {
    const underline = new Line(
      { x: labelX - 1, y: labelY + 3 },
      { x: labelX + labelSize.width + 1, y: labelY + 3 }
    );
    this.addSVGChildElement(underline.node);
    return underline;
  }

  bindOptionLabelClick(labelNode, underlineNode, originBoxText, targetOption) {
    labelNode.addEventListener("click", () => {
      labelNode.style.cursor = "default";
      underlineNode.remove();
      this.drawOptionArrow({
        originBoxText,
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
    arrowLine.stroke(0.8);
    arrowLine.node.setAttribute("pointer-events", "none");

    this.addSVGChildElement(arrowLine.node);

    this.animateLineDrawing(arrowLine.node, {
      onDone: () => {
        arrowLine.addArrowHead(this.registerMarker.bind(this));
        onDone();
      }
    })
  }

  drawBoxedText({ text, position, animated, onDone }) {
    const boxSize = { width: 50, height: 30 };
    const coords = this._grid.getBoxCoords(position);
    const fontSize = 8;

    const boxedText = new BoxedText(text, fontSize, coords, boxSize);
    boxedText.node.setAttribute("id", `box-${position.toString()}`);

    this.addSVGChildElement(boxedText.node);

    if (animated) {
      this.animateLineDrawing(boxedText.rectNode, { onDone });
    } else {
      onDone();
    }
  }

  animateLineDrawing(node, { onDone }) {
    this.style.setProperty("--animatable-line-length", node.getTotalLength());
    node.style.animation = "draw-line calc(.15s * (var(--animatable-line-length) / 50)) ease-out";
    node.addEventListener("animationend", onDone);
  }
}

customElements.define("figure-18-diagram", Figure18Diagram);
