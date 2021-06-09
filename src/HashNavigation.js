export default class HashNavigation {
  constructor({ onNavigateToRoot, onNavigateToFigure, onNavigateToAbout }) {
    this._onNavigateToFigure = onNavigateToFigure;
    this._onNavigateToRoot = onNavigateToRoot;
    this._onNavigateToAbout = onNavigateToAbout;
    window.addEventListener("hashchange", this.onHashChange.bind(this));
  }

  init() {
    const figureNumFromHash = this.getFigureNumFromHash(window.location.hash);
    if (figureNumFromHash) {
      // If we already have a figure number given on start, the hashchange event won't fire,
      // So we trigger the handler manually.
      this._onNavigateToFigure(figureNumFromHash);
    } else if (window.location.hash == "#about") {
      this._onNavigateToAbout();
    } else {
      this.goToRoot();
    }
  }

  onHashChange(event) {
    if (this.isRoot(window.location.hash)) {
      this.goToRoot();
      return;
    }

    if (window.location.hash == "#about") {
      this._onNavigateToAbout();
      return;
    }

    const oldHash = (new URL(event.oldURL)).hash;
    const newFigureNum = this.getFigureNumFromHash(window.location.hash);
    const oldFigureNum = this.getFigureNumFromHash(oldHash);

    if (newFigureNum) {
      this._onNavigateToFigure(newFigureNum, oldFigureNum);
    } else if (this.isRoot(oldHash)) {
      this.clearHash();
    } else {
      this.goToRoot();
    }
  }

  getFigureNumFromHash(hash) {
    const figureNumRegex = /^#fig(\d\d?)$/g;
    const match = figureNumRegex.exec(hash);

    return match ? Number(match[1]) : null;
  }

  clearHash() {
    if (window.location.hash == "") {
      return;
    }

    window.history.pushState(
      null,
      null,
      "#" // An empty string results in no hash change at all
    );
  }

  isRoot(hash) {
    return hash == "" || hash == "#";
  }

  goToRoot() {
    this.clearHash();
    this._onNavigateToRoot();
  }

  goToFigure(figureNum) {
    window.history.pushState(
      { figure: figureNum },
      `Figure ${figureNum}`,
      `#fig${figureNum}`
     );

     // Call callback manually, as pushState never triggers a hashchange event
     // (as per spec)
    this._onNavigateToFigure(figureNum);
  }
}
