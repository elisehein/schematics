import { waitForAnimations } from "/helpers/transitionWithClasses.js";

const viewStates = {
  SHOWING_FIGURE: "SHOWING_FIGURE",
  SHOWING_PREVIEWS: "SHOWING_PREVIEWS",
  SHOWING_ABOUT: "SHOWING_ABOUT"
};

export default class ViewSwitcher {
  constructor({ previews, figure, toolbar, about, asideFigures, asideAbout, footer }) {
    this._previews = previews;
    this._figure = figure;
    this._toolbar = toolbar;
    this._about = about;
    this._asideFigures = asideFigures;
    this._asideAbout = asideAbout;
    this._footer = footer;

    this._state = null;
  }

  showPreviews() {
    if (this._state == viewStates.SHOWING_PREVIEWS) {
      return;
    }

    const show = () => {
      this._figure.removeAttribute("num");
      document.body.dataset.visibleView = "figure-previews";
      this._previews.show();
      this.ensureSecondaryElementsVisible();
      this._state = viewStates.SHOWING_PREVIEWS;
    };

    this.ensureAboutIsHiddenAndColorSchemeIsDark(() => {
      if (this._state == viewStates.SHOWING_ABOUT) {
        show();
      } else {
        this._toolbar.hide();
        this._figure.hide(show);
      }
    });
  }

  showFigure(num) {
    const show = () => {
      document.body.dataset.visibleView = "individual-figure";
      this._toolbar.active = num;

      if (this._state == viewStates.SHOWING_FIGURE) {
        this._figure.switchNum(num);
      } else {
        this._toolbar.show();
        this._figure.showWithNum(num);
      }

      this.ensureSecondaryElementsVisible();
      this._state = viewStates.SHOWING_FIGURE;
    };

    this.ensureAboutIsHiddenAndColorSchemeIsDark(() => {
      if (this._state == viewStates.SHOWING_ABOUT) {
        show();
      } else {
        this._previews.hide(show);
      }
    });
  }

  showAbout() {
    if (this._state == viewStates.SHOWING_ABOUT) {
      return;
    }

    this.hideAsides();

    const show = () => {
      this.setColorScheme("light", () => {
        document.body.dataset.visibleView = "about-schematics";
        this._about.show();
        this.ensureSecondaryElementsVisible();
        this._state = viewStates.SHOWING_ABOUT;
      });
    };

    if (this._state == viewStates.SHOWING_PREVIEWS) {
      this._previews.hide(show);
    } else {
      this._previews.hide();
      this._toolbar.hide();
      this._figure.hide(show);
    }
  }

  ensureAboutIsHiddenAndColorSchemeIsDark(onDone) {
    if (this._state == viewStates.SHOWING_ABOUT) {
      this._about.hide();
      this.hideAsides();
    }

    this.setColorScheme("dark", onDone);
  }

  /* Don't show these elements until the first requested view has
   * been rendered in order to avoid funky layout shifts */
  ensureSecondaryElementsVisible() {
    this._asideFigures.style.opacity = 1;
    this._asideAbout.style.opacity = 1;
    this._footer.style.opacity = 1;
  }

  hideAsides() {
    this._asideAbout.style.opacity = 0;
    this._asideFigures.style.opacity = 0;
  }

  setColorScheme(scheme, onDone = () => {}) {
    document.body.dataset.colorScheme = scheme;
    waitForAnimations(document.body, onDone);
  }
}
