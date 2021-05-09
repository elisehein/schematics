export default class HashNavigation {
  constructor({ onFigureChange }) {
    this._onFigureChange = onFigureChange;
    window.addEventListener("hashchange", this.onNavigation.bind(this));
  }

  init({ defaultFigureNum }) {
    const figureNumFromHash = this.getFigureNumFromHash();
    if (figureNumFromHash) {
      // If we already have a figure number given on start, the hashchange event won't fire,
      // So we trigger the handler manually.
      this._onFigureChange(figureNumFromHash);
    } else {
      this.goToFigure(defaultFigureNum);
    }
  }

  getFigureNumFromHash(hash) {
    const currentHash = hash || window.location.hash;
    const figureNumRegex = /^#fig(\d\d?)$/g;
    const match = figureNumRegex.exec(currentHash);

    return match ? Number(match[1]) : null;
  }

  onNavigation(event) {
    const newFigureNum = this.getFigureNumFromHash();
    const oldFigureNum = this.getFigureNumFromHash((new URL(event.oldURL)).hash);

    if (newFigureNum) {
      this._onFigureChange(newFigureNum, oldFigureNum);
    } else if (oldFigureNum) {
      this.goToFigure(oldFigureNum);
    } else {
      this.clearHash();
    }
  }

  clearHash() {
    window.history.pushState(
      null,
      null,
      "#"
    )
  }

  goToFigure(figureNum) {
    window.history.pushState(
      { figure: figureNum },
      `Figure ${figureNum}`,
      `#fig${figureNum}`
     );

     // Call callback manually, as pushState never triggers a hashchange event
     // (as per spec)
    this._onFigureChange(figureNum);
  }
}
