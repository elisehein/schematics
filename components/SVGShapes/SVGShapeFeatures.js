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

// eslint-disable-next-line max-lines-per-function
export const animatable = ({ node }) => ({
  animateAttribute(attribute, {
    from, to, dur, values, keyTimes, calcMode, keySplines, repeatCount, fill, begin, id
  }) {
    const animate = document.createElementNS("http://www.w3.org/2000/svg", "animate");

    let attributeName, attributeType;

    if (typeof attribute == "string") {
      attributeName = attribute;
    } else {
      attributeName = attribute.name;
      attributeType = attribute.type;
    }

    animate.setAttribute("attributeName", attributeName);
    animate.setAttribute("dur", `${dur}s`);

    if (from && to) {
      animate.setAttribute("from", from);
      animate.setAttribute("to", to);
    } else if (values) {
      animate.setAttribute("values", values);
    }

    this.setAttributesIfPresent({
      attributeType, keyTimes, calcMode, keySplines, repeatCount, fill, begin, id
    }, animate);

    node.appendChild(animate);
  },

  animateTransform(type, { values, keyTimes, calcMode, keySplines, dur, begin, repeatCount, fill, id }) {
    const animate = document.createElementNS("http://www.w3.org/2000/svg", "animateTransform");
    animate.setAttribute("attributeName", "transform");
    animate.setAttribute("attributeType", "XML");
    animate.setAttribute("type", type);
    animate.setAttribute("values", values);
    animate.setAttribute("dur", `${dur}s`);

    this.setAttributesIfPresent({
      keyTimes, calcMode, keySplines, begin, repeatCount, fill, id
    }, animate);

    node.appendChild(animate);
  },

  setAttributesIfPresent(optionalAttributes, animateNode) {
    Object.keys(optionalAttributes).forEach(key => {
      if (optionalAttributes[key]) {
        animateNode.setAttribute(key, optionalAttributes[key]);
      }
    });
  },

  beginAnimation(id) {
    if (id) {
      node.querySelector(`[id="${id}"]`).beginElement();
    } else {
      // If no ID is given, assume that the node holds a single animation node
      node.firstChild.beginElement();
    }
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
