import { Line, Path, Circle, Text, BoxedText, TypingText } from "./SVGShapes.js";
import { strokeable } from "./SVGShapeFeatures.js";

export default class SVGShapeFactory {
  constructor(isThumbnail) {
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
    return new Text(...args);
  }

  getBoxedText(...args) {
    return new BoxedText(this.strokeable, ...args);
  }

  getTypingText(...args) {
    return new TypingText(this.strokeable, ...args);
  }
}

