import Figure from "./Figure.js";
import { Marker, Circle, Line } from "./SVGShape.js";

const markerID = "circle-marker";

export default class Figure36 extends Figure {
  constructor() {
    super(36);

    this._pendulumLength = 190;
    this._initialAngle = 30;
    this._anchorPoint = { x: 150, y: (300 - this._pendulumLength) / 2 };
    this._totalAnimationFrames = 10;
  }

  draw() {
    super.draw();
    this.defineCircleMarker();
    this.drawPendulum();
  }

  defineCircleMarker() {
    const radius = 20;
    const diameter = radius * 2;
    const safeArea = 4;
    const markerSize = diameter + (safeArea * 2);

    const marker = new Marker(markerID, markerSize, markerSize);
    const circle = new Circle(radius + safeArea, radius + safeArea, radius);
    marker.addShape(circle.node);
    this.defineMarker(marker.node);
  }

  drawPendulum() {
    const pendulum = new Line(...this.getPointsWithSwingingArm(0));

    pendulum.node.innerHTML = this.getAnimationNodeString();

    const markerURL = `url(#${markerID})`;
    pendulum.node.setAttribute("marker-mid", markerURL);
    pendulum.node.setAttribute("marker-start", markerURL);
    pendulum.node.setAttribute("marker-end", markerURL);
    this.addSVGChildElement(pendulum.node);
  }

  getAnimationNodeString() {
    const easeIn = ".12 0 .39 0";
    const easeOut = ".61 1 .88 1"

    const values = [
      this.getPointsWithSwingingArm(0).map(({ x, y }) => `${x},${y}`).join(" "),
      this.getPointsWithSwingingArm(1).map(({ x, y }) => `${x},${y}`).join(" "),
      this.getPointsWithSwingingArm(2).map(({ x, y }) => `${x},${y}`).join(" ")
    ];

    return `
    <animate
      attributeName="points"
      values="${values.join(";")}"
      keyTimes="0; 0.5; 1"
      calcMode="spline"
      keySplines="${easeIn}; ${easeOut}"
      dur="15s"
      begin="0s"
      repeatCount="indefinite"
      fill="freeze" />
    `;
  }

  getPointsWithSwingingArm(animationFrameIndex) {
    const swingAngle =
      this._initialAngle / this._totalAnimationFrames *
      (this._totalAnimationFrames - (animationFrameIndex + 1));

    let swingingPoint;

    if (animationFrameIndex % 2 == 0) {
      // Swinging back (left, towards initial position)
      swingingPoint = Figure36.getPendulumCoordinates(this._anchorPoint, swingAngle, this._pendulumLength);
    } else {
      // Swinging forward (right)
      swingingPoint = Figure36.getMirroredPendulumCoordinates(this._anchorPoint, swingAngle, this._pendulumLength);
    }

    return [
      swingingPoint,
      this._anchorPoint,
      Figure36.getMirroredPendulumCoordinates(this._anchorPoint, this._initialAngle, this._pendulumLength)
    ]
  }

  static getPendulumCoordinates(anchorPoint, angle, length) {
    const { x, y } = this.translationFromOrigin(angle, length);
    return {
      x: anchorPoint.x - x,
      y: anchorPoint.y + y
    }
  }

  static getMirroredPendulumCoordinates(anchorPoint, angle, length) {
    const { x, y } = this.translationFromOrigin(angle, length);
    return {
      x: anchorPoint.x + x,
      y: anchorPoint.y + y
    }
  }

  static translationFromOrigin(angle, length) {
    const alpha = 90 - angle;
    const alphaRad = degreesToRadians(alpha);
    const x = Math.cos(alphaRad) * length;
    const y = Math.sin(alphaRad) * length;

    return { x, y };
  }
}

function degreesToRadians(deg) {
  return deg * (Math.PI / 180);
}

customElements.define("figure-36", Figure36);