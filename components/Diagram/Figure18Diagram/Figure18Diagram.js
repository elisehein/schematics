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

  drawAfterCaption() {
    super.drawAfterCaption();
    this._timerManager.setTimeout(() => this.drawBoxWithOptions(firstBox), 1000);
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
        return;
      }

      const typingDurationSeconds = animated ? 0.2 + (index * 0.3 ): 0;
      const labelAppearanceDelayMS = animated ? 700 + (index * 600 ) : 0;

      this._timerManager.setTimeout(() => {
        this.drawOptionLabel(originBoxText, option, typingDurationSeconds);
      }, labelAppearanceDelayMS);
    });
  }

  drawOptionLabel(originBoxText, option, animationDurationSeconds) {
    const sizerLabel = new Text(option.label, { x: 0, y: 0 }, 8);
    const originBoxCoords = this._grid.getBoxCoords(data[originBoxText].position);
    const { x, y } = this._grid.getOptionLabelCoords(originBoxCoords, option.labelPosition, sizerLabel.getSize());

    const label = new TypingText(option.label, { x, y }, animationDurationSeconds, 8);
    this.addSVGChildElement(label.node);
    label.textNode.style.cursor = "pointer";

    label.animateTyping();

    this._timerManager.setTimeout(() => {
      const underline = this.drawOptionLabelUnderline(x, y, label.intrinsicSize);
      this.bindOptionLabelClick(label, underline.node, originBoxText, option);
    }, animationDurationSeconds * 1000)
  }

  drawOptionLabelUnderline(labelX, labelY, labelSize) {
    const underline = new Line(
      { x: labelX - 1, y: labelY + 3 },
      { x: labelX + labelSize.width + 1, y: labelY + 3 }
    );
    this.addSVGChildElement(underline.node);
    return underline;
  }

  bindOptionLabelClick(label, underlineNode, originBoxText, option) {
    label.node.addEventListener("click", () => {
      label.textNode.style.cursor = "default";
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

    this.animateBasedOnLength(arrowLine, () => {
      arrowLine.addArrowHead(this.registerMarker.bind(this));
      onDone();
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

    const boxedText = new BoxedText(text, fontSize, boxGeometry, animated, originPoint);
    boxedText.stroke(0.8);
    boxedText.node.setAttribute("id", `box-${position.toString()}`);

    this.addSVGChildElement(boxedText.node);

    if (animated) {
      this.animateBasedOnLength(boxedText);
      boxedText.animateTyping(onDone);
    } else {
      onDone();
    }
  }

  animateBasedOnLength(path, onDone = () => {}) {
    const durationExpression = lengthCSSProperty => `calc(.15s * (var(${lengthCSSProperty}) / 30))`;
    path.animateStroke(durationExpression, "ease-out", onDone);
  }
}

customElements.define("figure-18-diagram", Figure18Diagram);
