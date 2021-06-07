export default class ViewSwitcher {
  constructor(previews, figure, toolbar) {
    this._previews = previews;
    this._figure = figure;
    this._toolbar = toolbar;
  }

  showPreviews() {
    this._toolbar.hide();
    this._figure.hide(() => {
      document.body.dataset.visibleView = "figure-previews";
      this._previews.show();
    });
  }

  showFigure(num, { forceRestart }) {
    this._toolbar.active = num;
    this._toolbar.show();
    document.body.dataset.visibleView = "individual-figure";
    this._previews.hide(() => {
      this._figure.showNewFigure(num, { forceRestart });
    });
  }
}
