import getFigure, { orderedFigures } from "./figures/FigureFactory.js";
import Navigation from "./Navigation.js";

const figureNode = document.getElementById("figure");

const nav = new Navigation({
  onFigureChange: (newFigureNum, oldFigureNum) => {
    // TODO navigate back to old figure num of default if figure doesn't exist
    const figure = getFigure(figureNode, newFigureNum);
    figure.draw();
    figure.animate();
  }
});

nav.init({ defaultFigureNum: orderedFigures[0] });