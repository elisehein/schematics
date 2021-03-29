export default class Figure {
  constructor(canvas, figureClass) {
    canvas.classList.add(figureClass);
    this._figureClass = figureClass;
    this._canvas = canvas;
  }

  draw() {}
}