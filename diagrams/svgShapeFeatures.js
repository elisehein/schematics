export const strokeable = ({ node }) => ({
  stroke() {
    node.style.fill = "transparent";
    node.style.stroke = "currentColor";
  }
});

export const fillable = ({ node }) => ({
  fill() {
    node.style.fill = "currentColor";
    node.style.stroke = "transparent";
  }
});

export const havingLength = ({ node }) => ({
  getLength() {
    return node.getTotalLength();
  }
});

export const withOptionalArrowHead = ({ node }, arrowHeadMarker) => {
  return {
    addArrowHead(registerMarker) {
      registerMarker(arrowHeadMarker.node)
      node.setAttribute("marker-end", `url(#${arrowHeadMarker.node.id})`);
    }
  }
};
