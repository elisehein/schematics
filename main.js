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
    updateNavigation(newFigureNum);
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

  setTimeout(diagramElement.animate.bind(diagramElement), 2000);
}

function updateNavigation(newFigureNum) {
  const prevLink = document.getElementById("previous-figure");
  const nextLink = document.getElementById("next-figure");

  const newFigureNumIndex = orderedFigures.indexOf(newFigureNum);
  const prevFigureNum = orderedFigures[newFigureNumIndex - 1];
  const nextFigurNum = orderedFigures[newFigureNumIndex + 1];

  prevLink.style.display = prevFigureNum ? "block" : "none";
  nextLink.style.display = nextFigurNum ? "block" : "none";

  if (prevFigureNum) {
    prevLink.setAttribute("href", `#fig${prevFigureNum}`);
    prevLink.querySelector("span").innerText = `fig. ${prevFigureNum}`;
  }

  if (nextFigurNum) {
    nextLink.setAttribute("href", `#fig${nextFigurNum}`);
    nextLink.querySelector("span").innerText = `fig. ${nextFigurNum}`;
  }
}

nav.init({ defaultFigureNum });