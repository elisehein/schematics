import { Line, Circle, createSVGElement } from "../../SVGShapes/SVGShapes.js";
import { swingable } from "./swingable.js";
import { clickable } from "./clickable.js";

export default function PendulumArm(anchorPoint, initialAngle, length, radius) {
  const groupNode = createSVGElement("g");

  const arm = drawArm(anchorPoint, initialAngle, length);
  groupNode.appendChild(arm.node);

  const circle = drawEndOfArmCircle(length, anchorPoint, initialAngle, radius);
  groupNode.appendChild(circle.node);

  const self = { node: groupNode, arm, circle };

  return Object.assign(
    self,
    clickable(self),
    swingable(self, anchorPoint, initialAngle)
  );
}

function drawArm(anchorPoint, rotationAngle, length) {
  const arm = getDownwardArm(anchorPoint, length);
  addRotation(arm.node, rotationAngle, anchorPoint);
  return arm;
}

function addRotation(node, angle, anchorPoint) {
  node.setAttribute(
    "transform",
    `rotate(${angle} ${anchorPoint.x} ${anchorPoint.y})`
  );
}

function drawEndOfArmCircle(armLength, anchorPoint, rotationAngle, radius) {
  const circle = new Circle(anchorPoint.x, anchorPoint.y + armLength + radius, radius);
  circle.stroke();
  addRotation(circle.node, rotationAngle, anchorPoint);
  return circle;
}

function getDownwardArm(anchorPoint, length) {
  return new Line(
    anchorPoint,
    { x: anchorPoint.x, y: anchorPoint.y + length }
  );
}
