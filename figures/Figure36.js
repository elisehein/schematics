import Figure from "./Figure.js";
import { Marker, Circle, Line } from "./SVGShape.js";

const markerID = "circle-marker";
const markerIDAnchor = "circle-marker--anchor";

export default class Figure36 extends Figure {
  constructor() {
    super(36);

    this._pendulumLength = 170;
    this._initialAngle = 30;
    this._anchorPoint = { x: 150, y: (300 - this._pendulumLength) / 2 };
    this._totalAnimationFrames = 10;
  }

  draw() {
    super.draw();
    this.defineCircleMarker({ anchor: false });
    this.defineCircleMarker({ anchor: true });
    this.drawStaticArm();
    this.drawSwingingArm();
  }

  drawStaticArm() {
    const staticArm = this.getDownwardArm();

    staticArm.node.setAttribute(
      "transform",
      `rotate(${this._initialAngle * -1} ${this._anchorPoint.x} ${this._anchorPoint.y})`
    );

    const markerURL = id => `url(#${id})`;
    staticArm.node.setAttribute("marker-start", markerURL(markerIDAnchor));
    staticArm.node.setAttribute("marker-end", markerURL(markerID));
    this.addSVGChildElement(staticArm.node);
  }

  drawSwingingArm() {
    const swingingArm = this.getDownwardArm();

    const markerURL = `url(#${markerID})`;
    swingingArm.node.setAttribute("marker-end", markerURL);

    swingingArm.node.innerHTML = this.getAnimationNodeString();

    this.addSVGChildElement(swingingArm.node);
  }

  getDownwardArm() {
    return new Line(
      this._anchorPoint,
      { x: this._anchorPoint.x, y: this._anchorPoint.y + this._pendulumLength }
    )
  }

  defineCircleMarker({ anchor }) {
    const radius = 20;
    const diameter = radius * 2;
    const safeArea = 4;
    const markerSize = diameter + (safeArea * 2);

    const markerX = markerSize / 2.0;
    const markerY = anchor ? markerX : markerX - radius;

    const marker = new Marker(
      anchor ? markerIDAnchor : markerID,
      markerSize,
      markerSize,
      markerX,
      markerY);
    const circle = new Circle(radius + safeArea, radius + safeArea, radius);

    marker.addShape(circle.node);
    this.defineMarker(marker.node);
  }

  getAnimationNodeString() {
    const easeInOut = ".4 0 .6 1"

    const totalFrames = 30;
    const frameDuration = 1.5;

    const rotationValue = deg => `${deg} ${this._anchorPoint.x} ${this._anchorPoint.y}`;
    const angleChangeStep = this._initialAngle / totalFrames;
    const swingAngle = frameIndex => angleChangeStep * (totalFrames - (frameIndex + 1));

    const rotationValues = Array(totalFrames).fill().map((value, animationFrameIndex) => {
      const mirroringFactor = animationFrameIndex % 2 == 0 ? 1 : -1;
      return rotationValue(swingAngle(animationFrameIndex) * mirroringFactor);
    });

    const times = Array(totalFrames).fill().map((value, index) => {
      return 0 + (1 / (totalFrames - 1) * index);
    });

    return `
    <animateTransform
      attributeName="transform"
      attributeType="XML"
      type="rotate"
      values="${rotationValues.join("; ")}"
      keyTimes="${times.join("; ")}"
      calcMode="spline"
      keySplines="${Array(totalFrames - 1).fill(easeInOut).join("; ")}"
      dur="${totalFrames * frameDuration}s"
      begin="0s"
      repeatCount="1"
      fill="freeze" />
    `;
  }
}

customElements.define("figure-36", Figure36);