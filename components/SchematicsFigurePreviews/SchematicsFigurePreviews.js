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

    const anchor = preview.querySelector("a");
    anchor.setAttribute("href", `#fig${num}`);
    anchor.appendChild(getDiagram(num, true));

    const figureNum = anchor.querySelector("[data-figure-num]");
    figureNum.dataset.num = num;
    figureNum.innerText = num;

    return preview;
  }
}

customElements.define("schematics-figure-previews", SchematicsFigurePreviews);
