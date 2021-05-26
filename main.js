import "./components/SchematicsFigure/SchematicsFigure.js";
import "./components/SchematicsFigurePreviews/SchematicsFigurePreviews.js";
import "./components/FigureList/FigureList.js";
import "./components/ScanLines.js";

import { figureExists, orderedFigures } from "./figureData.js";
import HashNavigation from "./HashNavigation.js";

document.addEventListener("DOMContentLoaded", () => {
  const schematicsFigure = document.querySelector("schematics-figure");

  const figurePreviews = document.querySelector("schematics-figure-previews");
  const figureList = document.querySelector("figure-list");
  figureList.nums = orderedFigures;

  initNav(schematicsFigure, figureList, figurePreviews);
});

function initNav(schematicsFigure, figureList, figurePreviews) {
  let showingPreviews;

  const nav = new HashNavigation({
    onNavigateToRoot: () => {
      if (showingPreviews) {
        return;
      }

      showPreviews(schematicsFigure, figureList, figurePreviews);
      showingPreviews = true;
    },
    onNavigateToFigure: newFigureNum => {
      if (!figureExists(newFigureNum)) {
        nav.goToRoot();
        return;
      }

      figureList.active = newFigureNum;

      showIndividualFigure(newFigureNum, schematicsFigure, figureList, figurePreviews, showingPreviews);
      showingPreviews = false;
    }
  });

  nav.init();
}

function showIndividualFigure(newFigureNum, schematicsFigure, figureList, figurePreviews, forceRestart) {
  schematicsFigure.showNewFigure(newFigureNum, { forceRestart });
  figureList.show();
  figurePreviews.style.display = "none";
}

function showPreviews(schematicsFigure, figureList, figurePreviews) {
  figureList.hide();
  schematicsFigure.hide(() => {
    figurePreviews.style.display = "block";
    figureList.style.display = "none";
  });
}
