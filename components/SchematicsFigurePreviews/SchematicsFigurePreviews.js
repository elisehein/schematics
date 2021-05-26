import { orderedFigures, getDiagram } from "../../figureData.js";

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
}

customElements.define("schematics-figure-previews", SchematicsFigurePreviews);
