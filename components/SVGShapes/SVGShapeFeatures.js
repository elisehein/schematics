export const strokeable = ({ node }) => ({
  stroke(strokeWidth = 1, strokeColor = "currentcolor") {
    node.style.fill = "transparent";
    node.style.stroke = strokeColor;
    node.style.strokeWidth = strokeWidth;
    node.style.strokeLinecap = "round";
  },

  dash(dashWidth) {
    node.style.strokeDasharray = dashWidth;
  }
});

export const fillable = ({ node }) => ({
  fill() {
    node.style.fill = "currentcolor";
    node.style.stroke = "transparent";
  }
});

export const havingLength = ({ node }) => ({
  getLength() {
    return node.getTotalLength();
  }
});

export const withOptionalArrowHead = ({ node }, arrowHeadMarker) => ({
  addArrowHead(registerMarker) {
    registerMarker(arrowHeadMarker.node)
    node.setAttribute("marker-end", `url(#${arrowHeadMarker.node.id})`);
  }
});

export const havingIntrinsicSize = ({ node }) => ({
  // Temporarily render the node off-screen to get the size via bounding box
  getSize() {
    const tmp = node.cloneNode(true);

    tmp.style.position = "absolute";
    tmp.style.left = "-1000px";
    tmp.style.top = "-1000px";

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.appendChild(tmp);
    document.body.appendChild(svg);

    const { width, height } = tmp.getBBox();

    svg.remove();

    return { width, height };
  }
});