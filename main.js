import { getPoetry, getDiagramElement, orderedFigures } from "./figures/FigureFactory.js";
import Navigation from "./Navigation.js";

const figureNode = document.getElementById("figure");

const nav = new Navigation({
  onFigureChange: (newFigureNum, oldFigureNum) => {
    // TODO navigate back to old figure num of default if figure doesn't exist

    figureNode.className = `figure${newFigureNum}`;
    setPoetry(getPoetry(newFigureNum));
    replaceDiagram(newFigureNum);
  }
});

function setPoetry(poetry) {
  const figcaption = figureNode.querySelector("figcaption");
  figcaption.innerText = poetry;
}

function replaceDiagram(num) {
  const diagramContainerNode = figureNode.querySelector(".diagram-container");
  diagramContainerNode.innerHTML = "";

  const diagramElement = getDiagramElement(num);
  diagramContainerNode.appendChild(diagramElement);
  diagramElement.animate();
}

nav.init({ defaultFigureNum: orderedFigures[0] });