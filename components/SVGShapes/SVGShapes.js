/* eslint-disable id-length */
import { strokeable, fillable, havingLength, withOptionalArrowHead } from "./SVGShapeFeatures.js";

/*
 * The components here are not Web Components but rather your vanilla
 * JS function-based objects, because you cannot extend SVGElement.
 * For all intents and purposes, they act as other ui components.
 */

export function Marker({ id, width, height, x, y, viewBox, autoOrient }) {
  const node = createSVGElement("marker");
  node.setAttribute("id", id);
  node.setAttribute("markerWidth", width);
  node.setAttribute("markerHeight", height);
  node.setAttribute("refX", x || width / 2.0);
  node.setAttribute("refY", y || height / 2.0);

  if (autoOrient) {
    node.setAttribute("orient", "auto-start-reverse");
  }

  if (viewBox) {
    node.setAttribute("viewBox", viewBox);
  }

  const addShape = shapeNode => {
    node.appendChild(shapeNode);
  }

  return { node, addShape };
}

Marker.arrowHead = (() => {
  const marker = new Marker({
    id: "arrowhead-marker",
    width: 8,
    height: 8,
    x: 6,
    y: 5,
    viewBox: "0 0 10 10",
    autoOrient: true
  });
  const arrow = new Path("M 1 1 L 7 5 L 1 9 z");
  arrow.fill();
  marker.addShape(arrow.node);
  return marker;
})();

export function Line(...points) {
  const node = createSVGElement("polyline");
  node.setAttribute("points", points.map(({ x, y }) => `${x},${y}`).join(" "));

  const self = { node };

  const result = Object.assign(
    self,
    strokeable(self),
    havingLength(self),
    withOptionalArrowHead(self, Marker.arrowHead)
  );

  result.stroke();
  return result;
}

export function Circle(cx, cy, r) {
  const node = createSVGElement("circle");
  node.setAttribute("cx", cx);
  node.setAttribute("cy", cy);
  node.setAttribute("r", r);

  const self = { node };

  return Object.assign(
    self,
    strokeable(self),
    fillable(self)
  );
}

export function Path(d) {
  const node = createSVGElement("path");
  node.setAttribute("d", d);
  const self = { node };

  return Object.assign(
    self,
    strokeable(self),
    fillable(self),
    havingLength(self),
    withOptionalArrowHead(self, Marker.arrowHead)
  )
}

export function Arc({ x, y, radius }, { startAngle, endAngle }) {
  const polarToCartesian = angleInDegrees => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

    return {
      x: x + (radius * Math.cos(angleInRadians)),
      y: y + (radius * Math.sin(angleInRadians))
    };
  }

  const start = polarToCartesian(endAngle);
  const end = polarToCartesian(startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  const d = `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;

  return new Path(d);
}

export function Text(text, { x, y }, fontSize = 10) {
  const node = createSVGElement("text");
  node.setAttribute("x", x);
  node.setAttribute("y", y);

  // Setting the font size via an attribute, we get the benefit of scaling
  // according to the coordinate system specified in viewBox.
  node.setAttribute("font-size", fontSize);

  // Letter-spacing causes the space between letters to not react to pointer events
  node.setAttribute("pointer-events", "bounding-box");
  node.innerHTML = text;
  node.style.fontFamily = "inherit";
  node.style.letterSpacing = ".1em";

  const self = { node };

  const result = Object.assign(
    self,
    fillable(self)
  );

  result.fill();
  return result;
}

export function BoxedText(text, fontSize, { x, y }, { width, height }) {
  const g = createSVGElement("g");

  const rectNode = createSVGElement("rect");
  rectNode.setAttribute("x", x);
  rectNode.setAttribute("y", y);
  rectNode.setAttribute("width", width);
  rectNode.setAttribute("height", height);
  strokeable({ node: rectNode }).stroke(0.8);
  g.appendChild(rectNode);

  const textShape = new Text(
    text,
    { x: x + (width / 2.0), y: y + (height / 2.0) },
    fontSize
  );
  textShape.node.setAttribute("dominant-baseline", "middle");
  textShape.node.setAttribute("text-anchor", "middle");

  g.appendChild(textShape.node);

  return { node: g };
}

export function createSVGElement(elementName) {
  return document.createElementNS("http://www.w3.org/2000/svg", elementName);
}
