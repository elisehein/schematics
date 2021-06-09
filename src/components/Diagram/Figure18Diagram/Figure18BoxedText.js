import { havingLength } from "../../SVGShapes/SVGShapeFeatures.js";
import { createSVGElement } from "../../SVGShapes/SVGShapes.js";
import { targetSideTouchPoints } from "./data.js";

export default function Figure18BoxedText(shapeFactory, text, fontSize, { x, y, width, height }, animated, targetSideTouchPoint) {
  // eslint-disable-next-line id-length
  const g = createSVGElement("g");

  const rect = getRectAsPathWithOriginPoint(shapeFactory, { x, y, width, height, originPoint: targetSideTouchPoint });
  g.appendChild(rect.node);

  const sizerText = shapeFactory.getText(text, { x: 0, y: 0 }, fontSize);
  const textSize = sizerText.getSize();

  // 4.0 is a magic number that results in the text being vertically aligned
  const textY = y + (height / 2.0) + (textSize.height / 4.0);
  const textX = x + (width / 2.0) - (textSize.width / 2.0);

  const typingDuration = animated ? randomIntBetween(5, 1.2) / 10.0 : 0;
  const textShape = shapeFactory.getTypingText(text, { x: textX, y: textY }, typingDuration, fontSize);

  g.appendChild(textShape.node);

  const animateTyping = onDone => {
    textShape.animateTyping(null, onDone);
  };

  return Object.assign(
    {
      node: g,
      animateTyping
    },
    havingLength({ node: rect.node }),
    shapeFactory.strokeable({ node: rect.node })
  );
}

function getRectAsPathWithOriginPoint(shapeFactory, { x, y, width, height, originPoint }) {
  // eslint-disable-next-line id-length
  let d;

  const topLeftCorner = `${x},${y}`;
  const topRightCorner = `${x + width},${y}`;
  const bottomRightCorner = `${x + width},${y + height}`;
  const bottomLeftCorner = `${x},${y + height}`;
  const topMiddlePoint = `${x + (width / 2)},${y}`;
  const bottomMiddlePoint = `${x + (width / 2)},${y + height}`;
  const leftMiddlePoint = `${x},${y + (height / 2)}`;

  switch (originPoint) {
    case targetSideTouchPoints.TOP_SIDE_MIDDLE:
      d = getPathD(topMiddlePoint, topRightCorner, bottomRightCorner, bottomLeftCorner, topLeftCorner);
      break;
    case targetSideTouchPoints.BOTTOM_SIDE_LEFT:
      d = getPathD(bottomLeftCorner, bottomRightCorner, topRightCorner, topLeftCorner);
      break;
    case targetSideTouchPoints.BOTTOM_SIDE_MIDDLE:
      d = getPathD(bottomMiddlePoint, bottomRightCorner, topRightCorner, topLeftCorner, bottomLeftCorner);
      break;
    case targetSideTouchPoints.LEFT_SIDE_MIDDLE:
      d = getPathD(leftMiddlePoint, topLeftCorner, topRightCorner, bottomRightCorner, bottomLeftCorner);
      break;
    case targetSideTouchPoints.RIGHT_SIDE_TOP:
    default:
      d = getPathD(topRightCorner, bottomRightCorner, bottomLeftCorner, topLeftCorner);
  }

  return shapeFactory.getPath(d);
}

function getPathD(...points) {
  // eslint-disable-next-line id-length
  const d = points
    .map((point, index) => {
      if (index == 0) {
        return `M ${point}`;
      } else {
        return `L ${point}`;
      }
    })
    .join(" ");

    return `${d} Z`;
}

function randomIntBetween(min, max) {
  return Math.floor((Math.random() * (max - min + 1)) + min);
}
