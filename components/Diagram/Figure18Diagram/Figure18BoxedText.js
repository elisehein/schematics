/* eslint-disable id-length */
import { havingLength, strokeable } from "../../SVGShapes/SVGShapeFeatures.js";
import { TypingText, Path, createSVGElement, Text } from "../../SVGShapes/SVGShapes.js";
import { targetSideTouchPoints } from "./data.js";
import random from "https://cdn.skypack.dev/lodash/random";

export default function Figure18BoxedText(text, fontSize, { x, y, width, height }, animated, targetSideTouchPoint) {
  const g = createSVGElement("g");

  const rect = getRectAsPathWithOriginPoint({ x, y, width, height, originPoint: targetSideTouchPoint });
  g.appendChild(rect.node);

  const sizerText = new Text(text, { x: 0, y: 0 }, fontSize);
  const textSize = sizerText.getSize();

  // 4.0 is a magic number that results in the text being vertically aligned
  const textY = y + (height / 2.0) + (textSize.height / 4.0);
  const textX = x + (width / 2.0) - (textSize.width / 2.0);

  const typingDuration = animated ? random(0.3, 0.8) : 0;
  const textShape = new TypingText(text, { x: textX, y: textY }, typingDuration, fontSize);

  g.appendChild(textShape.node);

  const animateTyping = onDone => {
    textShape.animateTyping(null, onDone);
  }

  return Object.assign(
    {
      node: g,
      animateTyping
    },
    havingLength({ node: rect.node }),
    strokeable({ node: rect.node })
  );
}

function getRectAsPathWithOriginPoint({ x, y, width, height, originPoint }) {
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

  return new Path(d);
}

function getPathD(...points) {
  const d = points
    .map((point, index) => {
      if (index == 0) {
        return `M ${point}`;
      } else {
        return `L ${point}`
      }
    })
    .join(" ");

    return `${d} Z`;
}
