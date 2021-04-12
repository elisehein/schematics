class ButtonLink extends HTMLAnchorElement {
  constructor(){
    super();
    this.classList.add("button", "link-type");
  }

  connectedCallback() {
    const iconName = this.getAttribute("icon");
    if (!iconName || !icons[iconName]) {
      return;
    }

    this.classList.add("button--with-icon");
    this.insertAdjacentHTML("afterbegin", icons[iconName]);
    this.querySelector("svg").classList.add("button__icon");
  }
}

const icons = {
  grid: `
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="0" stroke-linecap="round" stroke-linejoin="round" class="feather feather-grid"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
  `
};

customElements.define("button-link", ButtonLink, { extends: "a" });