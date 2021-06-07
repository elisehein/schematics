import { orderedFigures, getDiagram } from "../../figureData.js";

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

    const diagram = getDiagram(num, true);
    diagram.classList.add("schematics-figure-previews__item__diagram");
    anchor.appendChild(diagram);

    const figureNum = preview.querySelector("[data-figure-num]");
    figureNum.dataset.num = num;
    figureNum.innerText = num;

    preview.querySelector("scan-lines").setAttribute("color", "var(--schematics-figure-preview-scan-line-color)");

    return preview;
  }

  show() {
    this.style.visibility = "visible";
    this.classList.add(`${transitioningClassName}--showing`);
    this.style.display = "block";
    this.transition(() => {
      this.classList.remove(`${transitioningClassName}--showing`);
    });
  }

  hide(onDone) {
    this.classList.add(`${transitioningClassName}--hiding`);
    this.transition(() => {
      this.classList.remove(`${transitioningClassName}--hiding`);
      this.style.display = "none";
      onDone();
    });
  }

  transition(onDone = () => {}) {
    this.classList.add(transitioningClassName);

    const stopTransitioning = () => {
      this.classList.remove(transitioningClassName);
      onDone();
    };

    if (this.getAnimations().length > 0) {
      this.addEventListener("animationend", stopTransitioning, { once: true });
    } else {
      stopTransitioning();
    }
  }
}

customElements.define("schematics-figure-previews", SchematicsFigurePreviews);
