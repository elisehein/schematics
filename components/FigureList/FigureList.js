const DIRECTION = {
  previous: -1,
  next: 1
};

export default class FigureList extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = `
    <nav>
      <ul></ul>
    </nav>
    `;

    if (this.nums === null || !this.nums.length) {
      return;
    }

    this.querySelector("ul").innerHTML = `
      ${this.renderDirectionalLink(-1)}
      ${this.renderFigureLinks()}
      ${this.renderDirectionalLink(1)}
    `;
  }

  renderDirectionalLink(direction) {
    const isNext = direction == DIRECTION.next;
    const labelID = `${isNext ? "next" : "previous"}-link-label`
    const labelText = isNext ? "Next" : "Previous";

    const label = `
    <span class="figure-list__directional-link__label" id="${labelID}">
      ${labelText} figure
    </span>
    `;

    return `
    <li class="${this.itemClass()}">
      <a id="${this.directionalLinkID(direction)}" class="figure-list__directional-link" aria-labelledby="${labelID}">
        ${isNext ? `${label} &rarr;` : `&larr; ${label}`}
      </a>
    </li>
    `;
  }

  renderFigureLinks() {
    return this.nums.map(num => `
      <li class="${this.itemClass()}" data-figure-link="${num}">
        <a href="#fig${num}">fig. ${num}</a>
      </li>
    `).join("");
  }

  switchActiveLink(num) {
    this.querySelectorAll("[data-figure-link]").forEach(figureLink => {
      figureLink.classList.remove(this.itemClass(true));
    });
    this.querySelector(`[data-figure-link="${num}"]`).classList.add(this.itemClass(true));

    this.configureDirectionalLink(DIRECTION.next);
    this.configureDirectionalLink(DIRECTION.previous);
  }

  configureDirectionalLink(direction) {
    const linkNode = document.getElementById(this.directionalLinkID(direction));
    const activeNumIndex = this.nums.indexOf(this.active);
    const targetNum = this.nums[activeNumIndex + (direction == DIRECTION.next ? 1 : -1)];

    if (targetNum) {
      linkNode.setAttribute("href", `#fig${targetNum}`);
    } else {
      linkNode.setAttribute("aria-hidden", true);
      linkNode.removeAttribute("href");
    }
  }

  directionalLinkID(direction) {
    return `${direction == DIRECTION.next ? "next" : "previous"}-figure-link`;
  }

  itemClass(active = false) {
    return `figure-list__item${active ? "--active" : ""}`;
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
        this.switchActiveLink(newValue);
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

customElements.define("figure-list", FigureList);
