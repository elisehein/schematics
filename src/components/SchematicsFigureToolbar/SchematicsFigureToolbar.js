import transitionWithClasses from "/helpers/transitionWithClasses.js";

const DIRECTION = {
  previous: -1,
  next: 1
};

const transitioningClassName = "schematics-figure-toolbar--transitioning";

export default class SchematicsFigureToolbar extends HTMLElement {
  connectedCallback() {
    this.classList.add("schematics-figure-toolbar");
    this.render();
  }

  render() {
    const template = document.getElementById("schematics-figure-toolbar-template").cloneNode(true).content;
    template.querySelector("ul").innerHTML = this.renderLinks();
    this.replaceChildren(template);
  }

  renderLinks() {
    if (this.nums === null || !this.nums.length) {
      return;
    }

    // eslint-disable-next-line consistent-return
    return `
      ${this.renderDirectionalLink(-1)}
      ${this.renderFigureLinks()}
      ${this.renderDirectionalLink(1)}
    `;
  }

  renderDirectionalLink(direction) {
    const isNext = direction == DIRECTION.next;
    const labelID = `${isNext ? "next" : "previous"}-link-label`;
    const labelText = isNext ? "Next" : "Previous";
    const targetNum = this.nums[this.activeNumIndex + (isNext ? 1 : -1)];

    const label = `
    <span class="schematics-figure-toolbar__directional-link__label" id="${labelID}">
      ${labelText} figure
    </span>
    `;

    const anchorContents = isNext ? `${label}<span>&rarr;</span>` : `<span>&larr;</span>${label}`;

    return `
    <li
      class="${this.itemClasses({ directional: true })}"
      aria-hidden="${targetNum ? "false" : "true"}" >
      <a
        id="${this.directionalLinkID(direction)}"
        class="schematics-figure-toolbar__directional-link"
        aria-controls="individual-figure"
        aria-labelledby="${labelID}"
        ${targetNum ? `href="#fig${targetNum}"` : ""} >
        ${anchorContents}
      </a>
    </li>
    `;
  }

  renderFigureLinks() {
    return this.nums.map(num => `
      <li
        class="${this.itemClasses({ active: num == this.active, figure: true })}"
        data-figure-link="${num}">
        <a
          aria-controls="individual-figure"
          aria-selected="${num == this.active}"
          href="#fig${num}">fig. ${num}</a>
      </li>
    `).join("");
  }

  update(oldNum) {
    [oldNum, this.active]
      .filter(num => num)
      .forEach((num, index) => {
        const node = this.querySelector(`[data-figure-link="${num}"] a`);

        transitionWithClasses(node, [this.itemClass("figure__transitioning-active")], () => {
          if (index > 0) {
            // No need to run completion more than once
            return;
          }

          this.querySelector("[data-active-item-index]").dataset.activeItemIndex = this.activeNumIndex;
          this.querySelector("ul").innerHTML = this.renderLinks();
        });
      });
  }

  directionalLinkID(direction) {
    return `${direction == DIRECTION.next ? "next" : "previous"}-figure-link`;
  }

  itemClasses(variations = {}) {
    const classes = [this.itemClass()];

    Object.keys(variations).forEach(variation => {
      if (variations[variation]) {
        classes.push(this.itemClass(variation));
      }
    });

    return classes.join(" ");
  }

  itemClass(variation) {
    const baseClass = "schematics-figure-toolbar__item";
    return variation ? `${baseClass}--${variation}` : baseClass;
  }

  show() {
    this.style.display = "flex";
    transitionWithClasses(this, [transitioningClassName, `${transitioningClassName}--showing`]);
  }

  hide() {
    transitionWithClasses(this, [transitioningClassName, `${transitioningClassName}--hiding`], () => {
      this.style.display = "none";
    });
  }

  get activeNumIndex() {
    return this.nums.indexOf(this.active);
  }

  static get observedAttributes()  {
    return ["nums", "active"];
  }

  attributeChangedCallback(attrName, oldValue, newValue) {
    if (newValue == oldValue) {
      return;
    }

    switch (attrName) {
      case "nums":
        this.render();
        break;
      case "active":
        this.update(oldValue);
        break;
      default:
        break;
    }
  }

  get nums() {
    return JSON.parse(this.getAttribute("nums"));
  }

  set nums(newValue) {
    if (newValue !== this.nums) {
      this.setAttribute("nums", JSON.stringify(newValue));
    }
  }

  get active() {
    return parseInt(this.getAttribute("active"));
  }

  set active(newValue) {
    if (newValue !== this.active) {
      this.setAttribute("active", newValue);
    }
  }
}

customElements.define("schematics-figure-toolbar", SchematicsFigureToolbar);
