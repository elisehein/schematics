export default class Figure {
  constructor(figure, num, a11yDescription, poetry) {
    this._figureClass = `figure${num}`;

    // Remove figure-specific class name
    figure.className = "";
    figure.classList.add(this._figureClass);

    const canvas = figure.querySelector("svg");

    canvas.querySelector("title").innerHTML = `fig. ${num}`;
    canvas.querySelector("desc").innerHTML = a11yDescription;

    const figcaption = figure.querySelector("figcaption");
    figcaption.innerText = poetry;

    this._canvas = canvas;
  }

  draw() {}
  animate() {}
}