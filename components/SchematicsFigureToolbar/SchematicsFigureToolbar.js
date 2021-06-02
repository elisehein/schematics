const DIRECTION = {
  previous: -1,
  next: 1
};

export default class SchematicsFigureToolbar extends HTMLElement {
  connectedCallback() {
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
      class="${this.itemClass({ directional: true })}"
      aria-hidden="${targetNum ? "false" : "true"}" >
      <a
        id="${this.directionalLinkID(direction)}"
        class="schematics-figure-toolbar__directional-link"
        aria-labelledby="${labelID}"
        ${targetNum ? `href="#fig${targetNum}"` : ""} >
        ${anchorContents}
      </a>
    </li>
    `;
  }

  renderFigureLinks() {
    return this.nums.map(num => `
      <li class="${this.itemClass({ active: num == this.active, figure: true })}" data-figure-link="${num}">
        <a href="#fig${num}">fig. ${num}</a>
      </li>
    `).join("");
  }

  update() {
    this.querySelector("[data-active-item-index]").dataset.activeItemIndex = this.activeNumIndex;
    this.querySelector("ul").innerHTML = this.renderLinks();
  }

  directionalLinkID(direction) {
    return `${direction == DIRECTION.next ? "next" : "previous"}-figure-link`;
  }

  itemClass(variations = {}) {
    const baseClass = "schematics-figure-toolbar__item";
    const classes = [baseClass];

    Object.keys(variations).forEach(variation => {
      if (variations[variation]) {
        classes.push(`${baseClass}--${variation}`);
      }
    });

    return classes.join(" ");
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
        this.update();
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

  show() {
    this.style.display = "flex";
  }

  hide() {
    this.style.display = "none";
  }
}

customElements.define("schematics-figure-toolbar", SchematicsFigureToolbar);
