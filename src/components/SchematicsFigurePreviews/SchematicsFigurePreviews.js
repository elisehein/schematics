import { orderedFigures } from "../../figureData.js";
import transitionWithClasses from "/helpers/transitionWithClasses.js";

const transitioningClassName = "schematics-figure-previews--transitioning";

export default class SchematicsFigurePreviews extends HTMLElement {
  connectedCallback() {
    const itemTemplate = document.getElementById("schematics-figure-preview-template");

    this.innerHTML = `
    <nav>
      <ul>
      </ul>
    </nav>
    `;

    const previewsFragment = document.createDocumentFragment();
    orderedFigures
      .map(this.getPreviewFragment.bind(this, itemTemplate))
      .forEach(frag => {
        previewsFragment.appendChild(frag);
      });

    this.querySelector("ul").appendChild(previewsFragment);
  }

  getPreviewFragment(itemTemplate, num) {
    const preview = itemTemplate.cloneNode(true).content;
    preview.querySelector("li").classList.add(`schematics-figure-previews__item--${num}`);

    const anchor = preview.querySelector("a");
    anchor.setAttribute("href", `#fig${num}`);
    anchor.setAttribute("aria-label", `Figure ${num}`);

    const figureNum = preview.querySelector("[data-figure-num]");
    figureNum.dataset.num = num;
    figureNum.innerText = num;

    return preview;
  }

  show() {
    this.style.display = "block";
    transitionWithClasses(this, [transitioningClassName, `${transitioningClassName}--showing`]);
    this.renderThumbnailsIfNeeded();
  }

  hide(onDone = () => {}) {
    transitionWithClasses(this, [
      transitioningClassName, `${transitioningClassName}--hiding`
    ], () => {
      this.style.display = "none";
      onDone();
    });
  }

  // For performance reasons, we fetch and render the actual diagrams asynchronously
  // when the previews element is actually show()n. It may have already been on the page
  // to avoid layout shifts, but if it's about to get hidden in favour of a different view,
  // no point in rendering the diagrams.
  async renderThumbnailsIfNeeded() {
    const module = await import("../Diagram/DiagramFactory.js");
    const DiagramFactory = module.default;
    const diagramFactory = new DiagramFactory();

    const renderThumbnail = async num => {
      if (this.thumbnailExists(num)) {
        return;
      }

      const diagramElement = await diagramFactory(num, true);
      diagramElement.classList.add(this.thumbnailClassName);
      this.getAnchor(num).appendChild(diagramElement);
    };

    orderedFigures.forEach(num => renderThumbnail(num));
  }

  thumbnailExists(num) {
    const anchor = this.getAnchor(num);
    return anchor.querySelector(`.${this.thumbnailClassName}`) !== null;
  }

  getAnchor(num) {
    return this.querySelector(`[href="#fig${num}"]`);
  }

  get thumbnailClassName() {
    return "schematics-figure-previews__item__diagram";
  }
}

customElements.define("schematics-figure-previews", SchematicsFigurePreviews);
