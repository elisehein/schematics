/* eslint-disable id-length */
import Diagram from "../Diagram.js";
import data from "./data.js";
import Figure18DiagramGridCoordinateSystem from "./Figure18DiagramGridCoordinateSystem.js";
import BoxedText from "./Figure18BoxedText.js";
import { Line, TypingText, Text } from "../../SVGShapes/SVGShapes.js";

const firstBox = "good?";

export default class Figure18Diagram extends Diagram {
  constructor() {
    super(18);
    this._grid = new Figure18DiagramGridCoordinateSystem();
  }

  draw() {
    this.drawBoxWithOptions(firstBox, null, false);
  }

  drawBoxWithOptions(boxText, boxOriginPoint, animated = true) {
    const boxData = data[boxText];

    if (this.boxWithOptionsExists(boxData.position)) {
      return;
    }

    this.drawBoxedText({
      text: boxText,
      position: boxData.position,
      animated,
      originPoint: boxOriginPoint,
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
          this.drawOptionLabel(originBoxText, option, 0.2 + (0.4 * index));
        }, 700 + (index * 400));
      } else {
        this.drawOptionLabel(originBoxText, option, 5);
      }
    });
  }

  drawOptionLabel(originBoxText, option, animationDuration) {
    // Set zero origin to just get the text size at first, override coords later.
    const label = new TypingText(option.label, { x: 0, y: 0 }, animationDuration, 8);
    label.textNode.style.cursor = "pointer";

    const originBoxCoords = this._grid.getBoxCoords(data[originBoxText].position);
    const { x, y } = this._grid.getOptionLabelCoords(originBoxCoords, option.labelPosition, label.intrinsicSize);

    label.setCoords({ x, y });
    this.addSVGChildElement(label.node);

    const underline = this.drawOptionLabelUnderline(x, y, label.intrinsicSize);
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

  bindOptionLabelClick(labelNode, underlineNode, originBoxText, option) {
    labelNode.addEventListener("click", () => {
      labelNode.style.cursor = "default";
      underlineNode.remove();
      this.drawOptionArrow({
        originBoxText,
        option,
        onDone: () => this.drawBoxWithOptions(option.target, option.touchPoint)
      });
    }, { once: true });
  }

  drawOptionArrow({ originBoxText, option, onDone }) {
    const originPosition = data[originBoxText].position;
    const targetPosition = data[option.target].position;
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

  drawBoxedText({ text, position, animated, originPoint, onDone }) {
    const boxSize = { width: 50, height: 30 };
    const coords = this._grid.getBoxCoords(position);
    const fontSize = 8;

    const boxGeometry = {
      ...coords,
      ...boxSize
    };
    console.log("drawing boxed text origin point is", originPoint);
    const boxedText = new BoxedText(text, fontSize, boxGeometry, originPoint);
    boxedText.stroke(0.8);
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
