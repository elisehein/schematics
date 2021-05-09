export const strokeable = ({ node }) => ({
  stroke(strokeWidth = 1, strokeColor = "currentcolor") {
    node.style.fill = "transparent";
    node.style.stroke = strokeColor;
    node.style.strokeWidth = strokeWidth;
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
