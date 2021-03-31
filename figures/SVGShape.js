class SVGShape {
  constructor(node) {
    this._node = node;
  }

  get node() {
    return this._node;
  }
}

export class Line extends SVGShape {
  constructor({ x: startX, y: startY }, { x: endX, y: endY }, markerDef = "") {
    const node = createSVGElement("line");
    node.setAttribute("x1", startX);
    node.setAttribute("y1", startY);
    node.setAttribute("x2", endX);
    node.setAttribute("y2", endY);
    node.classList.add("line");

    if (markerDef) {
      node.setAttribute("marker-end", `url(#${markerDef})`);
    }

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
  constructor(text, { x, y }) {
    const node = createSVGElement("text");
    node.setAttribute("x", x);
    node.setAttribute("y", y);

    // Setting the font size via an attribute, we get the benefit of scaling
    // according to the coordinate system specified in viewBox.
    node.setAttribute("font-size", "10");

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
    rectNode.setAttribute("vector-effect", "non-scaling-stroke");
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

    super(g);
  }
}

function createSVGElement(elementName) {
  return document.createElementNS("http://www.w3.org/2000/svg", elementName);
}