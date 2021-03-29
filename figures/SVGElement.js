class SVGElement {
  get node() {
    return this._node;
  }
}

export class Line extends SVGElement {
  constructor(startPoint, endPoint) {
    super();
    const node = document.createElementNS("http://www.w3.org/2000/svg", "line");
    node.setAttribute("x1", startPoint.x);
    node.setAttribute("y1", startPoint.y);
    node.setAttribute("x2", endPoint.x);
    node.setAttribute("y2", endPoint.y);
    node.setAttribute("class", "line");
    this._node = node;
  }
}

export class Path extends SVGElement {
  constructor(d) {
    super();
    const node = document.createElementNS("http://www.w3.org/2000/svg", "path");
    node.setAttribute("d", d);
    node.setAttribute("class", "line");
    this._node = node;
  }
}