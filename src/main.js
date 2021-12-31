import "./components/SchematicsFigure/SchematicsFigure.js";
import "./components/SchematicsFigurePreviews/SchematicsFigurePreviews.js";
import "./components/SchematicsFigureToolbar/SchematicsFigureToolbar.js";
import "./components/AboutSchematics/AboutSchematics.js";
import "./components/ScanLines.js";

import { figureExists, orderedFigures } from "./figureData.js";
import HashNavigation from "./HashNavigation.js";
import ViewSwitcher from "./ViewSwitcher.js";

document.addEventListener("DOMContentLoaded", () => {
  const elements = {
    asideFigures: document.getElementById("aside-figures"),
    asideAbout: document.getElementById("aside-about"),
    footer: document.querySelector("footer"),
    about: document.querySelector("about-schematics"),
    previews: document.querySelector("schematics-figure-previews"),
    figure: document.querySelector("schematics-figure"),
    toolbar: document.querySelector("schematics-figure-toolbar")
  };
  elements.toolbar.nums = orderedFigures;

  const viewSwitcher = new ViewSwitcher(elements);
  initNav(viewSwitcher);

  printCurrentYearInCopyright();
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
    },
    onNavigateToAbout: () => {
      viewSwitcher.showAbout();
    }
  });

  nav.init();
}

function printCurrentYearInCopyright() {
  document.getElementById("copyright-year").innerText = (new Date()).getFullYear();
}

