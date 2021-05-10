import { figureExists, orderedFigures } from "./figureData.js";
import HashNavigation from "./HashNavigation.js";

const defaultFigureNum = orderedFigures[0];

document.addEventListener("DOMContentLoaded", () => {
  const schematicsFigure = document.querySelector("schematics-figure");

  const figureList = document.querySelector("figure-list");
  figureList.nums = orderedFigures;

  initNav(schematicsFigure, figureList);
});

function initNav(schematicsFigure, figureList) {
  const nav = new HashNavigation({
    onFigureChange: (newFigureNum, oldFigureNum) => {
      if (!figureExists(newFigureNum)) {
        nav.goToFigure(oldFigureNum || defaultFigureNum);
        return;
      }

      schematicsFigure.num = newFigureNum;
      figureList.active = newFigureNum;
    }
  });

  nav.init({ defaultFigureNum });
}

