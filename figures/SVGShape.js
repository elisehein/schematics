class SVGShape {
  constructor(node) {
    this._node = node;
  }

  get node() {
    return this._node;
  }
}

export class Marker extends SVGShape {
  constructor(id, width, height, x, y) {
    const node = createSVGElement("marker");
    node.setAttribute("id", id);
    node.setAttribute("markerWidth", width);
    node.setAttribute("markerHeight", height);
    node.setAttribute("refX", x || width / 2.0);
    node.setAttribute("refY", y || height / 2.0);
    super(node);
  }

  addShape(shapeNode) {
    this.node.appendChild(shapeNode);
  }
}

export class Line extends SVGShape {
  constructor(...points) {
    const node = createSVGElement("polyline");
    node.setAttribute("points", points.map(({x, y}) => `${x},${y}`).join(" "));
    node.classList.add("line");

    super(node);
  }

  addArrowHead() {
    this.node.setAttribute("marker-end", "url(#arrowhead-marker)");
  }

  get length() {
    return this.node.getTotalLength();
  }
}

export class Circle extends SVGShape {
  constructor(cx, cy, r) {
    const node = createSVGElement("circle");
    node.classList.add("line");
    node.setAttribute("cx", cx);
    node.setAttribute("cy", cy);
    node.setAttribute("r", r);
    super(node);
  }
}

export class Path extends SVGShape {
  constructor(d) {
    const node = createSVGElement("path");
    node.setAttribute("d", d);
    node.classList.add("line");
    super(node);
  }

  get length() {
    return this._node.getTotalLength();
  }
}

export class Text extends SVGShape {
  constructor(text, { x, y }, fontSize = 10) {
    const node = createSVGElement("text");
    node.setAttribute("x", x);
    node.setAttribute("y", y);

    // Setting the font size via an attribute, we get the benefit of scaling
    // according to the coordinate system specified in viewBox.
    node.setAttribute("font-size", fontSize);

    // Letter-spacing causes the space between letters to not react to pointer events
    node.setAttribute("pointer-events", "bounding-box");

    node.classList.add("text");
    node.innerHTML = text;
    super(node);
  }
}

export class BoxedText extends SVGShape {
  constructor(text, fontSize, { x, y }, { width, height }) {
    const g = createSVGElement("g");

    const rectNode = createSVGElement("rect");
    rectNode.setAttribute("x", x);
    rectNode.setAttribute("y", y);
    rectNode.setAttribute("width", width);
    rectNode.setAttribute("height", height);
    rectNode.classList.add("line");
    g.appendChild(rectNode);

    const textNode = createSVGElement("text");
    textNode.innerHTML = text;
    textNode.setAttribute("font-size", fontSize);
    textNode.setAttribute("x", (x + (width / 2.0)));
    textNode.setAttribute("y", (y + (height / 2.0)));
    textNode.setAttribute("dominant-baseline", "middle");
    textNode.setAttribute("text-anchor", "middle");
    textNode.classList.add("text");

    g.appendChild(textNode);
    g.classList.add("boxed-text");

    super(g);
  }
}

export function createSVGElement(elementName) {
  return document.createElementNS("http://www.w3.org/2000/svg", elementName);
}