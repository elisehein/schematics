export default class Figure extends HTMLElement {
  constructor(num) {
    super();
    this.num = num;
  }

  connectedCallback() {
    this.style.width = "100%";
    this.style.height = "100%";

    this.innerHTML = `
      <svg
        class="diagram"
        preserveAspectRatio="xMidYMin meet"
        role="img"
        viewbox="0 0 300 300"
        aria-labelledby="figure-title figure-desc"
        xmlns="http://www.w3.org/2000/svg">
        <title id="figure-title">${this.num}</title>
        <desc id="figure-desc">${this.a11yDescription}</desc>
      </svg>
    `;

    this.draw();
  }

  renderTitle() {
    const node = this.querySelector("#figure-title");
    if (node) {
      node.innerHTML = `fig. ${this.num}`;
    }
  }

  renderDescription() {
    const node = this.querySelector("#figure-desc");
    if (node) {
      node.innerHTML = this.a11yDescription;
    }
  }

  addSVGChildElement(el) {
    this.querySelector("svg").appendChild(el);
  }

  draw() {}
  animate() {}

  static get observedAttributes()  {
    return ["num", "a11ydescription"];
  }

  attributeChangedCallback(attrName, oldValue, newValue) {
    if (newValue == oldValue) {
      return;
    }

    switch (attrName) {
      case "num":
        this.renderTitle();
        break;
      case "a11ydescription":
        this.renderDescription();
        break;
    }
  }

  get a11yDescription() {
    return this.getAttribute("a11ydescription");
  }

  set a11yDescription(newValue) {
    if (newValue !== this.a11yDescription) {
      this.setAttribute("a11ydescription", newValue);
    }
  }

  get num() {
    return this.getAttribute("num");
  }

  set num(newValue) {
    if (newValue !== this.num) {
      this.setAttribute("num", newValue);
    }
  }
}