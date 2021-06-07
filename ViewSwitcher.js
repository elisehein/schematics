export default class ViewSwitcher {
  constructor(previews, figure, toolbar, aside, footer) {
    this._previews = previews;
    this._figure = figure;
    this._toolbar = toolbar;
    this._aside = aside;
    this._footer = footer;
  }

  showPreviews() {
    this._toolbar.hide();
    this._figure.hide(() => {
      document.body.dataset.visibleView = "figure-previews";
      this._previews.show();
      this.ensureOtherElementsVisible();
    });
  }

  showFigure(num, { forceRestart }) {
    this._previews.hide(() => {
      this._toolbar.active = num;
      this._toolbar.show();
      document.body.dataset.visibleView = "individual-figure";
      this._figure.showNewFigure(num, { forceRestart });
      this.ensureOtherElementsVisible();
    });
  }

  /* Don't show these elements until the first requested view has
   * been rendered in order to avoid funky layout shifts */
  ensureOtherElementsVisible() {
    this._aside.style.opacity = 1;
    this._footer.style.opacity = 1;
  }
}
