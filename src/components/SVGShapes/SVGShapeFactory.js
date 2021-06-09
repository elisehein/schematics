import { Line, Path, Circle, Text, TypingText } from "./SVGShapes.js";
import { strokeable } from "./SVGShapeFeatures.js";

export default class SVGShapeFactory {
  constructor(isThumbnail) {
    this._isThumbnail = isThumbnail;
    this.strokeable = strokeable.bind(null, isThumbnail);
  }

  getLine(...args) {
    return new Line(this.strokeable, ...args);
  }

  getPath(...args) {
    return new Path(this.strokeable, ...args);
  }

  getCircle(...args) {
    return new Circle(this.strokeable, ...args);
  }

  getText(...args) {
    return new Text(this._isThumbnail, ...args);
  }

  getTypingText(...args) {
    return new TypingText(this.strokeable, this._isThumbnail, ...args);
  }
}

