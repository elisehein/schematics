export default class Figure {
  constructor(canvas, num) {
    this._figureClass = `figure${num}`;
    this._canvas = canvas;

    canvas.classList.add(this._figureClass);
  }

  draw() {}
}