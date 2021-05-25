import "./components/SchematicsFigure/SchematicsFigure.js";
import "./components/SchematicsFigurePreviews/SchematicsFigurePreviews.js";
// import "./components/FigureList/FigureList.js";
import "./components/ScanLines.js";

import { figureExists, orderedFigures } from "./figureData.js";
import HashNavigation from "./HashNavigation.js";

document.addEventListener("DOMContentLoaded", () => {
  const schematicsFigure = document.querySelector("schematics-figure");

  const figureList = document.querySelector("figure-list");
  figureList.nums = orderedFigures;

  initNav(schematicsFigure, figureList);
});

function initNav(schematicsFigure, figureList) {
  const nav = new HashNavigation({
    onNavigateToRoot: () => {
      schematicsFigure.hide();
      figureList.style.display = "none";
    },
    onNavigateToFigure: newFigureNum => {
      if (!figureExists(newFigureNum)) {
        nav.goToRoot();
        return;
      }

      schematicsFigure.num = newFigureNum;
      figureList.active = newFigureNum;
      schematicsFigure.show();
      figureList.style.display = "block";
    }
  });

  nav.init();
}
