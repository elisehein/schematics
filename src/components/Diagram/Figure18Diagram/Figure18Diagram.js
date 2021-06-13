import Diagram from "../Diagram.js";
import data from "./data.js";
import Figure18DiagramGridCoordinateSystem from "./Figure18DiagramGridCoordinateSystem.js";
import BoxedText from "./Figure18BoxedText.js";
import { runActionsSequentially, waitBeforeNextAction } from "/helpers/sequentialActionRunning.js";

const firstBox = "good?";

export default class Figure18Diagram extends Diagram {
  constructor(isThumbnail) {
    super(18, isThumbnail);
    this._grid = new Figure18DiagramGridCoordinateSystem();
  }

  drawThumbnail() {
    this.drawBoxedText({
      text: firstBox,
      coords: { x: 60, y: 96, width: 180, height: 108 },
      fontSize: 28,
      animated: false,
      onDone: () => {}
    });
  }

  drawAfterCaption() {
    super.drawAfterCaption();

    runActionsSequentially([
      waitBeforeNextAction(1000, this._timerManager),
      this.smoothScrollIntoView.bind(this),
      waitBeforeNextAction(1000, this._timerManager),
      this.drawBoxWithOptions.bind(this, firstBox)
    ]);
  }

  drawBoxWithOptions(boxText, boxOriginPoint, animated = true, { onDone } = {}) {
    const boxData = data[boxText];
    const coords = this._grid.getBoxCoords(boxData.position);

    if (this.boxWithOptionsExists(coords)) {
      onDone && onDOne();
      return;
    }

    this.drawBoxedText({
      text: boxText,
      coords,
      animated,
      originPoint: boxOriginPoint,
      onDone: () => {
        if (boxData.options) {
          this.drawOptions(boxText, boxData.options, animated);
        }
        onDone && onDone();
      }
    });
  }

  boxWithOptionsExists(coords) {
    return this.querySelector(`#${this.getBoxID(coords)}`) !== null;
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
    const sizerLabel = this._svgShapeFactory.getText(option.label, { x: 0, y: 0 }, 8);
    const originBoxCoords = this._grid.getBoxCoords(data[originBoxText].position);
    const { x, y } = this._grid.getOptionLabelCoords(originBoxCoords, option.labelPosition, sizerLabel.getSize());

    const label = this._svgShapeFactory.getTypingText(option.label, { x, y }, animationDurationSeconds, 8);
    this.addSVGChildElement(label.node);

    label.animateTyping();

    this._timerManager.setTimeout(() => {
      const underline = this.drawOptionLabelUnderline(x, y, label.intrinsicSize);
      this.bindOptionLabelClick(label, underline.node, originBoxText, option);
    }, animationDurationSeconds * 1000)
  }

  drawOptionLabelUnderline(labelX, labelY, labelSize) {
    const underline = this._svgShapeFactory.getLine(
      { x: labelX - 1, y: labelY + 3 },
      { x: labelX + labelSize.width + 1, y: labelY + 3 }
    );
    this.addSVGChildElement(underline.node);
    return underline;
  }

  bindOptionLabelClick(label, underlineNode, originBoxText, option) {
    label.onClickOnce(() => {
      label.node.style.color = "var(--color-highest-contrast)";
      label.textNode.style.textShadow = "0 0 .3em var(--color-highest-contrast)";
      underlineNode.style.color = "var(--color-highest-contrast)";
    }, () => {
      label.node.style.color = "currentColor";
      label.textNode.style.textShadow = "none";
      underlineNode.style.color = "currentColor";
    }, () => {
      underlineNode.remove();
      this.drawOptionArrow({
        originBoxText,
        option,
        onDone: () => this.drawBoxWithOptions(option.target, option.touchPoint)
      });
    });
  }

  drawOptionArrow({ originBoxText, option, onDone, animated = true }) {
    const originPosition = data[originBoxText].position;
    const targetPosition = data[option.target].position;
    const arrowPoints = this._grid.getArrowCoordinatePoints(originPosition, targetPosition);
    const arrowLine = this._svgShapeFactory.getLine(...arrowPoints);
    arrowLine.stroke(0.8);
    arrowLine.node.setAttribute("pointer-events", "none");
    this.addSVGChildElement(arrowLine.node);

    const addArrowHeadAndFinish = () => {
      arrowLine.addArrowHead();
      onDone();
    }

    if (animated) {
      this.animateBasedOnLength(arrowLine, addArrowHeadAndFinish);
    } else {
      addArrowHeadAndFinish();
    }
  }

  drawBoxedText({ text, coords, animated, originPoint, onDone, fontSize }) {
    const boxSize = { width: coords.width || 50, height: coords.height || 30 };

    const boxGeometry = {
      ...coords,
      ...boxSize
    };

    const boxedText = new BoxedText(this._svgShapeFactory, text, fontSize || 8, boxGeometry, animated, originPoint);
    boxedText.stroke(0.8);
    boxedText.node.setAttribute("id", this.getBoxID(coords));

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

  getBoxID(coords) {
    return `box-${Math.round(coords.x)}-${Math.round(coords.y)}`;
  }
}

customElements.define("figure-18-diagram", Figure18Diagram);
