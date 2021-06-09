const viewStates = {
  SHOWING_FIGURE: "SHOWING_FIGURE",
  SHOWING_PREVIEWS: "SHOWING_PREVIEWS"
};

export default class ViewSwitcher {
  constructor(previews, figure, toolbar, aside, footer) {
    this._previews = previews;
    this._figure = figure;
    this._toolbar = toolbar;
    this._aside = aside;
    this._footer = footer;

    this._state = null;
  }

  showPreviews() {
    if (this._state == viewStates.SHOWING_PREVIEWS) {
      return;
    }

    this._toolbar.hide();
    this._figure.hide(() => {
      this._figure.removeAttribute("num");
      document.body.dataset.visibleView = "figure-previews";
      this._previews.show();
      this.ensureOtherElementsVisible();
      this._state = viewStates.SHOWING_PREVIEWS;
    });
  }

  showFigure(num) {
    this._previews.hide(() => {
      document.body.dataset.visibleView = "individual-figure";
      this._toolbar.active = num;

      if (this._state == viewStates.SHOWING_FIGURE) {
        this._figure.switchNum(num);
      } else {
        this._toolbar.show();
        this._figure.showWithNum(num);
      }

      this.ensureOtherElementsVisible();
      this._state = viewStates.SHOWING_FIGURE;
    });
  }

  /* Don't show these elements until the first requested view has
   * been rendered in order to avoid funky layout shifts */
  ensureOtherElementsVisible() {
    this._aside.style.opacity = 1;
    this._footer.style.opacity = 1;
  }
}
