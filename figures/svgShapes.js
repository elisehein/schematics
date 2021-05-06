import { strokeable, fillable, havingLength, withOptionalArrowHead } from "./svgShapeFeatures.js";

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
    width: 6,
    height: 6,
    x: 4,
    y: 4,
    viewBox: "0 0 8 8",
    autoOrient: true
  });
  const arrow = new Path("M 1 1 L 5 4 L 1 7 z");
  arrow.fill();
  marker.addShape(arrow.node);
  return marker;
})();

export function Line(...points) {
  const node = createSVGElement("polyline");
  node.setAttribute("points", points.map(({x, y}) => `${x},${y}`).join(" "));

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

export function Arc({ x, y }, radius, startAngle, endAngle) {
  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;

    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  }

  const describeArc = (x, y, radius, startAngle, endAngle) => {
    var start = polarToCartesian(x, y, radius, endAngle);
    var end = polarToCartesian(x, y, radius, startAngle);

    var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
  }

  return new Path(describeArc(x, y, radius, startAngle, endAngle));
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
  node.classList.add("text");

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
  strokeable({ node: rectNode }).stroke();
  g.appendChild(rectNode);

  const textShape = new Text(
    text,
    { x: x + (width / 2.0), y: y + (height / 2.0) },
    fontSize);
  textShape.node.setAttribute("dominant-baseline", "middle");
  textShape.node.setAttribute("text-anchor", "middle");

  g.appendChild(textShape.node);
  g.classList.add("boxed-text");

  return { node: g };
}

export function createSVGElement(elementName) {
  return document.createElementNS("http://www.w3.org/2000/svg", elementName);
}