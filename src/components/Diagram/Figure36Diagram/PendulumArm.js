import { createSVGElement } from "../../SVGShapes/SVGShapes.js";
import { swingable } from "./swingable.js";
import { clickable } from "./clickable.js";

export default function PendulumArm(shapeFactory, anchorPoint, initialAngle, length, radius) {
  const groupNode = createSVGElement("g");

  const arm = drawArm(anchorPoint, initialAngle, length, shapeFactory.getLine.bind(shapeFactory));
  groupNode.appendChild(arm.node);

  const circle = drawEndOfArmCircle(length, anchorPoint, initialAngle, radius, shapeFactory.getCircle.bind(shapeFactory));
  groupNode.appendChild(circle.node);

  const self = { node: groupNode, arm, circle };

  return Object.assign(
    self,
    clickable(self, shapeFactory.getCircle.bind(shapeFactory)),
    swingable(self, anchorPoint, initialAngle)
  );
}

function drawArm(anchorPoint, rotationAngle, length, getLine) {
  const arm = getDownwardArm(anchorPoint, length, getLine);
  addRotation(arm.node, rotationAngle, anchorPoint);
  return arm;
}

function addRotation(node, angle, anchorPoint) {
  node.setAttribute(
    "transform",
    `rotate(${angle} ${anchorPoint.x} ${anchorPoint.y})`
  );
}

function drawEndOfArmCircle(armLength, anchorPoint, rotationAngle, radius, getCircle) {
  const circle = getCircle(anchorPoint.x, anchorPoint.y + armLength + radius, radius);
  circle.stroke();
  addRotation(circle.node, rotationAngle, anchorPoint);
  return circle;
}

function getDownwardArm(anchorPoint, length, getLine) {
  return getLine(
    anchorPoint,
    { x: anchorPoint.x, y: anchorPoint.y + length }
  );
}
