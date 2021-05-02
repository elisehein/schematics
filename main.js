import { getPoetry, getDiagramElement, figureExists, orderedFigures } from "./figures/FigureFactory.js";
import HashNavigation from "./HashNavigation.js";

const mainNode = document.querySelector("main");
const figureTemplate = document.getElementById("single-figure-template");
const defaultFigureNum = orderedFigures[0];

const nav = new HashNavigation({
  onFigureChange: (newFigureNum, oldFigureNum) => {
    if (!figureExists(newFigureNum)) {
      nav.goToFigure(oldFigureNum || defaultFigureNum);
      return;
    }

    const figureNode = mainNode.querySelector("figure");

    if (oldFigureNum) {
      figureNode.addEventListener("transitionend", () => {
        handleNewFigure(mainNode, newFigureNum, oldFigureNum);
      }, { once: true });
      figureNode.classList.add("figure--exiting");
    } else {
      handleNewFigure(mainNode, newFigureNum);
    }
  }
});

function handleNewFigure(mainNode, newFigureNum, oldFigureNum) {
  mainNode.innerHTML = figureTemplate.innerHTML;
  const figureNode = mainNode.querySelector("figure");
  figureNode.classList.add(`figure${newFigureNum}`);

  setPoetry(figureNode.querySelector("figcaption"), getPoetry(newFigureNum));

  const diagramContainerNode = figureNode.querySelector(".diagram-container");
  setDiagram(diagramContainerNode, newFigureNum);

  updateNavigation(newFigureNum);
}

function setPoetry(figcaptionNode, poetry) {
  figcaptionNode.innerText = poetry;
}

function setDiagram(diagramContainerNode, num) {
  const diagramElement = getDiagramElement(num);
  diagramContainerNode.appendChild(diagramElement);

  setTimeout(diagramElement.animate.bind(diagramElement), 2000);
}

function updateNavigation(newFigureNum) {
  document.querySelectorAll("[data-figure-link]").forEach(figureLink => {
    figureLink.classList.remove("active");
  });
  document.querySelector(`[data-figure-link="${newFigureNum}"]`).classList.add("active");
}

nav.init({ defaultFigureNum });