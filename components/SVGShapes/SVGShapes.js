import { fillable, animatable, havingLength, withOptionalArrowHead, havingIntrinsicSize } from "./SVGShapeFeatures.js";

/*
 * The components here are not Web Components but rather your vanilla
 * JS function-based objects, because you cannot extend SVGElement.
 * For all intents and purposes, they act as other ui components.
 */

export function Line(strokeable, ...points) {
  const node = createSVGElement("polyline");
  node.setAttribute("points", points.map(({ x, y }) => `${x},${y}`).join(" "));

  const self = { node };

  const result = Object.assign(
    self,
    strokeable(self),
    havingLength(self),
    animatable(self),
    withOptionalArrowHead(self)
  );

  result.stroke();
  return result;
}

export function Circle(strokeable, cx, cy, r) {
  const node = createSVGElement("circle");
  node.setAttribute("cx", cx);
  node.setAttribute("cy", cy);
  node.setAttribute("r", r);

  const self = { node };

  return Object.assign(
    self,
    animatable(self),
    strokeable(self),
    fillable(self)
  );
}

// eslint-disable-next-line id-length
export function Path(strokeable, d) {
  const node = createSVGElement("path");

  if (d) {
    node.setAttribute("d", d);
  }

  const self = { node };

  return Object.assign(
    self,
    animatable(self),
    strokeable(self),
    fillable(self),
    havingLength(self),
    withOptionalArrowHead(self)
  );
}

export function Text(text, { x, y }, fontSize = 10) {
  const node = createSVGElement("text");

  if (x !== null && y !== null) {
    node.setAttribute("x", x);
    node.setAttribute("y", y);
  }

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
    fillable(self),
    havingIntrinsicSize(self)
  );

  result.fill();
  return result;
}

export function BoxedText(strokeable, text, fontSize, { x, y }, { width, height }) {
  // eslint-disable-next-line id-length
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

  return {
    node: g,
    rectNode,
    textNode: textShape.node
  };
}

export function TypingText(strokeable, text, { x, y }, animationDuration, fontSize = 10, thumbnail = false) {
  // eslint-disable-next-line id-length
  const g = createSVGElement("g");
  const id = `text-path-${Math.round(x)}-${Math.round(y)}`;

  const textShape = new Text(text, { x: null, y: null }, fontSize);
  const textSize = textShape.getSize();
  textShape.node.innerHTML = `<textPath href="#${id}">${text}</textPath>`;

  const textPath = new Path(strokeable);
  textPath.stroke(0);
  textPath.node.setAttribute("id", id);

  const startPathD = `M ${x},${y} h 0`;
  const endPathD = `M ${x},${y} h ${textSize.width}`;

  if (animationDuration == 0) {
    textPath.node.setAttribute("d", endPathD);
  } else {
    textPath.animateAttribute("d", {
      from: startPathD, to: endPathD, dur: animationDuration, fill: "freeze", begin: "indefinite"
    });
  }

  g.append(textPath.node, textShape.node);

  return {
    node: g,
    animateTyping: (...args) => textPath.beginAnimation(...args),
    textNode: textShape.node,
    intrinsicSize: textSize
  };
}

export function createSVGElement(elementName) {
  return document.createElementNS("http://www.w3.org/2000/svg", elementName);
}
