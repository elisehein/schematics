import { getPoetry, getDiagramElement, figureExists, orderedFigures } from "./figures/FigureFactory.js";
import HashNavigation from "./HashNavigation.js";

const figureNode = document.getElementById("figure");
const defaultFigureNum = orderedFigures[0];

const nav = new HashNavigation({
  onFigureChange: (newFigureNum, oldFigureNum) => {
    if (!figureExists(newFigureNum)) {
      nav.goToFigure(oldFigureNum || defaultFigureNum);
      return;
    }

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

nav.init({ defaultFigureNum });