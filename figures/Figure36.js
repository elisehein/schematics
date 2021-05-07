import Figure from "./Figure.js";
import { Marker, Circle, Line, Arc } from "./svgShapes.js";

const markerID = "circle-marker";
const anchorMarkerID = "circle-marker--anchor";

export default class Figure36 extends Figure {
  constructor() {
    super(36);

    this._pendulumLength = 200;
    this._markerRadius = 20;
    this._initialAngle = 30;

    // -10 in the end is to nudge it slightly towards the top to make room for
    // the dashed arrow
    const offset = 10;
    this._anchorPoint = { x: 150, y: (300 - this._pendulumLength) / 2 - offset };

    this._swingDuration = 2;
    this._totalSwings = 30;
    this._angleChangeStep = this._initialAngle / (this._totalSwings - 1);
  }

  draw() {
    super.draw();
    this.defineCircleMarker({ anchor: false });
    this.defineCircleMarker({ anchor: true });
    this.drawDashedArrow();

    const swingingArm = this.drawSwingingArm();

    const pointAtMarker = swingingArm.node.getPointAtLength(this._pendulumLength);
    pointAtMarker.y += this._markerRadius;

    const markerClickOverlay = this.drawMarkerClickOverlay(pointAtMarker);
    markerClickOverlay.node.addEventListener("click", () => this.swing(swingingArm, markerClickOverlay));
  }

  drawDashedArrow() {
    const arcRadius = this._pendulumLength + (this._markerRadius * 2) + 10;
    const arc = new Arc(this._anchorPoint, arcRadius, 160, 200);
    arc.stroke();
    arc.addArrowHead(this.registerMarker.bind(this));
    arc.node.classList.add("arrow");
    this.addSVGChildElement(arc.node);
  }

  addRotation(node, angle) {
    node.setAttribute(
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

  drawSwingingArm() {
    const swingingArm = this.getDownwardArm();
    this.setMarkers(swingingArm.node, true);
    this.addRotation(swingingArm.node, this._initialAngle);
    swingingArm.node.innerHTML = this.getSwingAnimationNodeString();
    this.addSVGChildElement(swingingArm.node);
    return swingingArm;
  }

  drawMarkerClickOverlay({ x, y }) {
    const markerClickOverlay = this.getMarkerCircle(x, y);
    markerClickOverlay.node.classList.add("marker-click-overlay");
    this.addRotation(markerClickOverlay.node, this._initialAngle);
    markerClickOverlay.node.innerHTML = this.getPulseAnimationNodeString();

    this.addSVGChildElement(markerClickOverlay.node);

    return markerClickOverlay;
  }

  swing(swingingArm, markerClickOverlay) {
    swingingArm.node.querySelector("animateTransform").beginElement();
    markerClickOverlay.node.remove();

    setTimeout(() => {
      this.drawStaticArm();
    }, this._swingDuration * 1000);
  }

  drawStaticArm() {
    const staticArm = this.getDownwardArm();
    this.addRotation(staticArm.node, (this._initialAngle - this._angleChangeStep) * -1);
    this.setMarkers(staticArm.node);
    this.addSVGChildElement(staticArm.node);
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

    const marker = new Marker({
      id: anchor ? anchorMarkerID : markerID,
      width: markerSize,
      height: markerSize,
      x: markerX,
      y: markerY
    });
    const circle = this.getMarkerCircle(this._markerRadius + safeArea, this._markerRadius + safeArea);

    marker.addShape(circle.node);
    this.registerMarker(marker.node);
  }

  getMarkerCircle(cx, cy) {
    const circle = new Circle(cx, cy, this._markerRadius);
    circle.stroke();
    return circle;
  }

  getSwingAnimationNodeString() {
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
      begin="indefinite"
      repeatCount="1"
      fill="freeze" />
    `;
  }

  getPulseAnimationNodeString() {
    const keyTimes = "0; 0.3; 1";
    const duration = "2s";
    const begin = "2s;"

    return `
    <animate
      attributeName="r"
      begin="${begin}"
      dur="${duration}"
      repeatCount="indefinite"
      values="${this._markerRadius}; ${this._markerRadius * 1.6}; ${this._markerRadius}"
      keyTimes="${keyTimes}" />
    <animate
      attributeType="xml"
      attributeName="stroke-opacity"
      begin="${begin}"
      dur="${duration}"
      values="1; 0; 0"
      keyTimes="${keyTimes}"
      repeatCount="indefinite" />
    `;
  }
}

customElements.define("figure-36", Figure36);