import "./components/SchematicsFigure/SchematicsFigure.js";
import "./components/SchematicsFigurePreviews/SchematicsFigurePreviews.js";
import "./components/SchematicsFigureToolbar/SchematicsFigureToolbar.js";
import "./components/ScanLines.js";

import { figureExists, orderedFigures } from "./figureData.js";
import HashNavigation from "./HashNavigation.js";

document.addEventListener("DOMContentLoaded", () => {
  const figure = document.querySelector("schematics-figure");
  const previews = document.querySelector("schematics-figure-previews");
  const toolbar = document.querySelector("schematics-figure-toolbar");

  toolbar.nums = orderedFigures;

  initNav(figure, toolbar, previews);
});

function initNav(figure, toolbar, previews) {
  let showingPreviews;

  const nav = new HashNavigation({
    onNavigateToRoot: () => {
      if (showingPreviews) {
        return;
      }

      showPreviews(figure, toolbar, previews);
      showingPreviews = true;
    },
    onNavigateToFigure: newFigureNum => {
      if (!figureExists(newFigureNum)) {
        nav.goToRoot();
        return;
      }

      toolbar.active = newFigureNum;

      showIndividualFigure(newFigureNum, figure, toolbar, previews, showingPreviews);
      showingPreviews = false;
    }
  });

  nav.init();
}

function showIndividualFigure(newFigureNum, figure, toolbar, previews, forceRestart) {
  document.body.dataset.visibleView = "individual-figure";
  figure.showNewFigure(newFigureNum, { forceRestart });
  toolbar.show();
  previews.style.display = "none";
}

function showPreviews(figure, toolbar, previews) {
  document.body.dataset.visibleView = "figure-previews";
  toolbar.hide();
  figure.hide(() => {
    previews.style.display = "block";
  });
}
