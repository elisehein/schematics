import getFigureFactory from "./figures/FigureFactory.js";

const figureNode = document.getElementById("figure");
const figureFactory = getFigureFactory(14);
const figure = figureFactory(figureNode);
figure.draw();
figure.animate();