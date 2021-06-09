import "./components/SchematicsFigure/SchematicsFigure.js";
import "./components/SchematicsFigurePreviews/SchematicsFigurePreviews.js";
import "./components/SchematicsFigureToolbar/SchematicsFigureToolbar.js";
import "./components/ScanLines.js";

import { figureExists, orderedFigures } from "./figureData.js";
import HashNavigation from "./HashNavigation.js";
import ViewSwitcher from "./ViewSwitcher.js";

document.addEventListener("DOMContentLoaded", () => {
  const aside = document.querySelector("aside");
  const footer = document.querySelector("footer");
  const previews = document.querySelector("schematics-figure-previews");
  const figure = document.querySelector("schematics-figure");
  const toolbar = document.querySelector("schematics-figure-toolbar");
  toolbar.nums = orderedFigures;

  const viewSwitcher = new ViewSwitcher(previews, figure, toolbar, aside, footer);
  initNav(viewSwitcher);
});

function initNav(viewSwitcher) {
  const nav = new HashNavigation({
    onNavigateToRoot: () => {
      viewSwitcher.showPreviews();
    },
    onNavigateToFigure: newFigureNum => {
      if (!figureExists(newFigureNum)) {
        nav.goToRoot();
        return;
      }

      viewSwitcher.showFigure(newFigureNum);
    }
  });

  nav.init();
}
