class SchArrow extends HTMLElement {
  connectedCallback() {
    const direction = this.getAttribute("direction");
    const arrowHeadPath = direction == "left" ?
      "M 10 4 L 10 16 L 0 10 z" :
      "M 190 4 L 190 16 L 200 10 z";
    const arrowHead = `
      <path
        class="arrowhead-marker" d="${arrowHeadPath}" />
    `;

    this.innerHTML = `
    <svg
      role="img"
      preserveAspectRatio="none"
      viewbox="0 0 200 20"
      xmlns="http://www.w3.org/2000/svg">
      <line
        vector-effect="non-scaling-stroke"
        class="line"
        x1="10"
        y1="10"
        x2="190"
        y2="10"></line>
      ${arrowHead}
    </svg>
    `;
  }
}

customElements.define("sch-arrow", SchArrow);