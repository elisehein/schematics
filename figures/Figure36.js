import Figure from "./Figure.js";
import { Marker, Circle, Line, Arc } from "./SVGShape.js";

const markerID = "circle-marker";
const anchorMarkerID = "circle-marker--anchor";

export default class Figure36 extends Figure {
  constructor() {
    super(36);

    this._pendulumLength = 200;
    this._markerRadius = 20;
    this._initialAngle = 30;
    this._anchorPoint = { x: 150, y: (300 - this._pendulumLength) / 2 };
    this._swingDuration = 2;
    this._totalSwings = 30;
    this._angleChangeStep = this._initialAngle / (this._totalSwings - 1);
  }

  draw() {
    super.draw();
    this.defineCircleMarker({ anchor: false });
    this.defineCircleMarker({ anchor: true });
    this.drawSwingingArm();

    const arcRadius = this._pendulumLength + (this._markerRadius * 2);
    const arc = new Arc(this._anchorPoint, arcRadius, 150, 210);
    this.addSVGChildElement(arc.node);

    setTimeout(() => {
      this.drawStaticArm();
    }, this._swingDuration * 1000);
  }

  rotateArm(armNode, angle) {
    armNode.setAttribute(
      "transform",
      `rotate(${angle} ${this._anchorPoint.x} ${this._anchorPoint.y})`
    );
  }

  setMarkers(armNode, anchor = false) {
    const markerURL = id => `url(#${id})`;
    armNode.setAttribute("marker-end", markerURL(markerID));

    if (anchor) {
      armNode.setAttribute("marker-start", markerURL(anchorMarkerID));
    }
  }

  drawStaticArm() {
    const staticArm = this.getDownwardArm();
    this.rotateArm(staticArm.node, (this._initialAngle - this._angleChangeStep) * -1);
    this.setMarkers(staticArm.node);
    this.addSVGChildElement(staticArm.node);
  }

  drawSwingingArm() {
    const swingingArm = this.getDownwardArm();
    this.setMarkers(swingingArm.node, true);
    this.rotateArm(swingingArm.node, this._initialAngle);

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
    const diameter = this._markerRadius * 2;
    const safeArea = 4;
    const markerSize = diameter + (safeArea * 2);

    const markerX = markerSize / 2.0;
    const markerY = anchor ? markerX : markerX - this._markerRadius;

    const marker = new Marker(
      anchor ? anchorMarkerID : markerID,
      markerSize,
      markerSize,
      markerX,
      markerY);
    const circle = new Circle(this._markerRadius + safeArea, this._markerRadius + safeArea, this._markerRadius);

    marker.addShape(circle.node);
    this.defineMarker(marker.node);
  }

  getAnimationNodeString() {
    const easeInOut = ".4 0 .6 1"

    const rotationValue = deg => `${deg} ${this._anchorPoint.x} ${this._anchorPoint.y}`;
    const swingAngle = swingIndex => this._angleChangeStep * (this._totalSwings - (swingIndex + 1));

    const rotationValues = Array(this._totalSwings).fill().map((_, swingIndex) => {
      const mirroringFactor = swingIndex % 2 == 0 ? 1 : -1;
      return rotationValue(swingAngle(swingIndex) * mirroringFactor);
    });

    const times = Array(this._totalSwings).fill().map((value, index) => {
      return 0 + (1 / (this._totalSwings - 1) * index);
    });

    return `
    <animateTransform
      attributeName="transform"
      attributeType="XML"
      type="rotate"
      values="${rotationValues.join("; ")}"
      keyTimes="${times.join("; ")}"
      calcMode="spline"
      keySplines="${Array(this._totalSwings - 1).fill(easeInOut).join("; ")}"
      dur="${this._totalSwings * this._swingDuration}s"
      begin="0s"
      repeatCount="1"
      fill="freeze" />
    `;
  }
}

customElements.define("figure-36", Figure36);