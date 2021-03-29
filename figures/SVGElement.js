class SVGElement {
  constructor(node) {
    this._node = node;
  }

  get node() {
    return this._node;
  }
}

export class Line extends SVGElement {
  constructor({ x: startX, y: startY }, { x: endX, y: endY }, markerDef = "") {
    const node = document.createElementNS("http://www.w3.org/2000/svg", "line");
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

export class Path extends SVGElement {
  constructor(d) {
    const node = document.createElementNS("http://www.w3.org/2000/svg", "path");
    node.setAttribute("d", d);
    node.classList.add("line");
    super(node);
  }

  get length() {
    return this._node.getTotalLength();
  }
}

export class Text extends SVGElement {
  constructor(text, { x, y }) {
    const node = document.createElementNS("http://www.w3.org/2000/svg", "text");
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