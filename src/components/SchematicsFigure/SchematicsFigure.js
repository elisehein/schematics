import transitionWithClasses from "/helpers/transitionWithClasses.js";

const baseClassName = "schematics-figure__figure";
const figureElementClassName = addition => `${baseClassName}__${addition}`;
const figureVariationClassName = variation => `${baseClassName}--${variation}`;

export default class SchematicsFigure extends HTMLElement {
  constructor(num) {
    super();
    this.num = num || this.getAttribute("num");
  }

  connectedCallback() {
    this.classList.add("schematics-figure");
    this.innerHTML = document.getElementById("schematics-figure-template").innerHTML;
    this.renderFigure();
  }

  async importRenderingDependencies() {
    const modules = await Promise.all([
      import("./FigureCaption.js"),
      import("../Diagram/DiagramFactory.js")
    ]);
    this.FigureCaption = modules[0].default;
    const DiagramFactory = modules[1].default;

    this._diagramFactory = new DiagramFactory({
      onLightUp: this.lightUpFigure.bind(this),
      onFuzzy: this.makeFigureFuzzy.bind(this),
      onJitter: this.jitterDiagram.bind(this),
      onDeleteCaption: ({ onDone }) => {
        this._captionElement.deleteCaption({ onDone });
      },
      onRetypeCaption: ({ onDone }) => {
        this._captionElement.animateCaption({ onDone });
      }
    });
  }

  async renderFigure() {
    if (!Number.isInteger(this.num)) {
      return;
    }

    await this.importRenderingDependencies();
    this._diagramElement = await this.renderDiagram();
    this._captionElement = this.renderCaption();

    this._diagramElement.drawBeforeCaption({ onDone: () => {
      this._diagramElement.drawAlongsideCaption();
      this._captionElement.animateCaption({ onDone: () => {
        this._diagramElement.drawAfterCaption();
      } });
    } });
  }

  cleanUpCurrentFigure(num) {
    this.classList.remove(this.className(num));

    if (this._captionElement) {
      this._captionElement.cleanUp();
    }

    if (this._diagramElement) {
      this._diagramElement.clearAllTimers();
    }

    clearTimeout(this._lightUpTimer);
    clearTimeout(this._fuzzyTimer);
    clearTimeout(this._hideCaptionTimer);
    this.figureNode.classList.remove(figureVariationClassName("light-up"));
    this.figureNode.classList.remove(figureVariationClassName("fuzzy"));
    this.figcaptionNode.classList.remove(figureElementClassName("figcaption--hidden"));

    this.diagramContainerNode.innerHTML = "";
  }

  lightUpFigure(duration) {
    if (this._lightUpTimer) {
      clearTimeout(this._lightUpTimer);
    }

    this.style.setProperty("--schematics-figure-light-up-duration", `${duration.s}s`);
    this.figureNode.classList.add(figureVariationClassName("light-up"));

    this._lightUpTimer = setTimeout(() => {
      this.figureNode.classList.remove(figureVariationClassName("light-up"));
      this._lightUpTimer = null;
    }, duration.ms);
  }

  makeFigureFuzzy(duration, { onDone } = {}) {
    if (this._fuzzyTimer) {
      clearTimeout(this._fuzzyTimer);
    }

    this.style.setProperty("--schematics-figure-fuzzy-duration", `${duration.s}s`);
    this.figureNode.classList.add(figureVariationClassName("fuzzy"));

    this._fuzzyTimer = setTimeout(() => {
      this.figureNode.classList.remove(figureVariationClassName("fuzzy"));
      this._fuzzyTimer = null;
      onDone && onDone();
    }, duration.ms);
  }

  jitterDiagram(duration, { onDone } = {}) {
    this.style.setProperty("--schematics-figure-jitter-duration", `${duration.s}s`);
    transitionWithClasses(this.diagramContainerNode, [
      figureElementClassName("diagram-container--jitter")
    ], onDone);
  }

  static get observedAttributes()  {
    return ["num"];
  }

  attributeChangedCallback(attrName, oldNum, newNum) {
    if (newNum == oldNum) {
      return;
    }

    if (newNum) {
      this.switchFigure(oldNum);
    } else {
      this.cleanUpCurrentFigure(oldNum);
    }
  }

  switchFigure(oldNum) {
    if (this._transitionTimer) {
      clearTimeout(this._transitionTimer);
    }

    const showNewFigure = () => {
      this._transitionTimer = setTimeout(async () => {
        this.classList.add(this.className(this.num));
        await this.renderFigure();
        transitionWithClasses(this.figureNode, [figureVariationClassName("showing")], () => {
          this._transitionTimer = null;
        });
      }, 1000);
    };

    if (oldNum) {
      transitionWithClasses(this.figureNode, [figureVariationClassName("hiding")], () => {
        this.cleanUpCurrentFigure(oldNum);
        showNewFigure();
      });
    } else {
      showNewFigure();
    }
  }

  async renderDiagram() {
    const diagramElement = await this._diagramFactory(this.num);
    this.diagramContainerNode.replaceChildren(diagramElement);
    return diagramElement;
  }

  renderCaption() {
    const captionElement = new this.FigureCaption(this.num);
    this.figcaptionNode.replaceChildren(captionElement);
    return captionElement;
  }

  className(num) {
    return `schematics-figure--${num}`;
  }

  get figureNode() {
    return this.querySelector(`.${baseClassName}`);
  }

  get figcaptionNode() {
    return this.querySelector("figcaption");
  }

  get diagramContainerNode() {
    return this.querySelector(`.${figureElementClassName("diagram-container")}`);
  }

  get num() {
    const raw = this.getAttribute("num");
    return raw ? parseInt(raw) : null;
  }

  set num(newValue) {
    if (newValue !== this.num) {
      this.setAttribute("num", newValue);
    }
  }

  switchNum(newNum) {
    this.num = newNum;
  }

  showWithNum(newNum) {
    this.style.display = "block";
    this.switchNum(newNum);
  }

  hide(onDone = () => {}) {
    transitionWithClasses(this.figureNode, [figureVariationClassName("hiding")], () => {
      this.style.display = "none";
      onDone();
    });
  }
}

customElements.define("schematics-figure", SchematicsFigure);
