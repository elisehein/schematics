import { figureExists, orderedFigures } from "./figureData.js";
import HashNavigation from "./HashNavigation.js";

const defaultFigureNum = orderedFigures[0];

document.addEventListener("DOMContentLoaded",function(){
  const schematicsFigure = document.querySelector("schematics-figure");
  initNav(schematicsFigure);
});

function initNav(schematicsFigure) {
  const nav = new HashNavigation({
    onFigureChange: (newFigureNum, oldFigureNum) => {
      if (!figureExists(newFigureNum)) {
        nav.goToFigure(oldFigureNum || defaultFigureNum);
        return;
      }

      schematicsFigure.num = newFigureNum;
      updateNavigation(newFigureNum);
    }
  });

  nav.init({ defaultFigureNum });
}

function updateNavigation(newFigureNum) {
  document.querySelectorAll("[data-figure-link]").forEach(figureLink => {
    figureLink.classList.remove("active");
  });
  document.querySelector(`[data-figure-link="${newFigureNum}"]`).classList.add("active");

  const prevLink = document.getElementById("previous-figure-link");
  const nextLink = document.getElementById("next-figure-link");

  const newFigureNumIndex = orderedFigures.indexOf(newFigureNum);
  const prevFigureNum = orderedFigures[newFigureNumIndex - 1];
  const nextFigurNum = orderedFigures[newFigureNumIndex + 1];

  configureDirectionalFigureLink(prevLink, prevFigureNum);
  configureDirectionalFigureLink(nextLink, nextFigurNum);
}

function configureDirectionalFigureLink(node, num) {
  if (num) {
    node.setAttribute("href", `#fig${num}`);
  } else {
    node.setAttribute("aria-hidden", true);
    node.removeAttribute("href");
  }
}
