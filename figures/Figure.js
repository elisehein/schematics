export default class Figure {
  constructor(figure, num, copy) {
    this._figureClass = `figure${num}`;

    const canvas = figure.querySelector("svg");

    canvas.querySelector("title").innerHTML = `fig. ${num}`;
    canvas.querySelector("desc").innerHTML = copy.a11yDescription;

    canvas.classList.add(this._figureClass);

    const figcaption = figure.querySelector("figcaption");
    figcaption.innerText = copy.poetry;

    this._canvas = canvas;
  }

  draw() {}
}