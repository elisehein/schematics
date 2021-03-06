export const strokeable = (isThumbnail, { node }) => ({
  stroke(strokeWidth = 1, strokeColor = "currentcolor") {
    node.style.stroke = strokeColor;
    node.style.strokeLinecap = "round";
    node.style.strokeWidth = isThumbnail && strokeWidth !== 0 ? 5 : strokeWidth;
  },

  dash(dashWidth) {
    node.style.strokeDasharray = dashWidth;
  },

  animateStroke(durationExpression, easing, onDone = () => {}) {
    const cssProperty = "--animatable-line-length";
    let duration = durationExpression;

    if (typeof durationExpression == "function") {
      duration = durationExpression(cssProperty);
    }

    node.style.setProperty(cssProperty, node.getTotalLength());
    node.style.animation = `draw-line ${duration} ${easing}`;
    node.addEventListener("animationend", onDone);
  }
});

export const fillable = ({ node }) => ({
  fill() {
    node.style.fill = "currentcolor";
  }
});

export const havingLength = ({ node }) => ({
  getLength() {
    return node.getTotalLength();
  }
});

export const withOptionalArrowHead = ({ node }) => ({
  addArrowHead() {
    node.setAttribute("marker-end", "url(#arrowhead-marker)");
  },

  removeArrowHead() {
    node.removeAttribute("marker-end");
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

  animateTransform(type, {
    from, to, values, keyTimes, calcMode, keySplines, dur, begin, repeatCount, fill, additive, id
  }) {
    const animate = document.createElementNS("http://www.w3.org/2000/svg", "animateTransform");
    animate.setAttribute("attributeName", "transform");
    animate.setAttribute("attributeType", "XML");
    animate.setAttribute("type", type);
    animate.setAttribute("dur", `${dur}s`);

    if (from && to) {
      animate.setAttribute("from", from);
      animate.setAttribute("to", to);
    } else if (values) {
      animate.setAttribute("values", values);
    }

    this.setAttributesIfPresent({
      keyTimes, calcMode, keySplines, begin, repeatCount, fill, additive, id
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

  beginAnimation(id = null, callback = () => {}) {
    const animationNode = this.getTargetAnimationNode(id);

    if (animationNode) {
      animationNode.addEventListener("endEvent", callback, { once: true });
      animationNode.beginElement();
    } else {
      callback();
    }
  },

  getTargetAnimationNode(id) {
    if (id) {
      return node.querySelector(`[id="${id}"]`);
    } else {
      // If no ID is given, assume that the node holds a single animation node
      const animationNode = node.firstChild;

      if (!animationNode) {
        console.warn("No animation node to trigger.");
      }

      return animationNode;
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

// eslint-disable-next-line max-lines-per-function
export const clickableWithKeyboardFocus = ({ node }) => ({
  onClickOnce(onFocusAndMouseover, onBlurAndMouseout, onClick) {
    this.indicateClickability(onFocusAndMouseover, onBlurAndMouseout);

    const clickHandler = event => {
      event.preventDefault();
      this.disableClickability(onFocusAndMouseover, onBlurAndMouseout);
      node.removeEventListener("mousedown", clickHandler);
      node.removeEventListener("touchstart", clickHandler);
      node.blur();
      onClick();
    };

    const keyupHandler = event => {
      if (event.keyCode !== 13) {
        return;
      }

      this.disableClickability(onFocusAndMouseover, onBlurAndMouseout);
      event.preventDefault();
      event.stopPropagation();
      node.removeEventListener("keyup", keyupHandler);
      node.blur();
      onClick();
    };

    // We want to prevent the focus event firing in case of click (to avoid visible outline)
    // so we use mousedown instead of click and preventDefault();
    // https://stackoverflow.com/questions/8735764/prevent-firing-focus-event-when-clicking-on-div
    node.addEventListener("mousedown", clickHandler);
    node.addEventListener("touchstart", clickHandler);
    node.addEventListener("keyup", keyupHandler);
  },

  indicateClickability(onFocusAndMouseover, onBlurAndMouseout) {
    node.setAttribute("focusable", true);
    node.setAttribute("tabindex", 0);
    node.setAttribute("role", "button");

    node.style.cursor = "pointer";
    node.addEventListener("focus", onFocusAndMouseover);
    node.addEventListener("blur", onBlurAndMouseout);
    node.addEventListener("mouseover", onFocusAndMouseover);
    node.addEventListener("mouseleave", onBlurAndMouseout);

  },

  disableClickability(onFocusAndMouseover, onBlurAndMouseout) {
    onBlurAndMouseout();
    node.setAttribute("focusable", false);
    node.removeAttribute("tabindex");
    node.removeAttribute("role");

    node.style.cursor = "default";
    node.removeEventListener("focus", onFocusAndMouseover);
    node.removeEventListener("blur", onBlurAndMouseout);
    node.removeEventListener("mouseover", onFocusAndMouseover);
    node.removeEventListener("mouseleave", onBlurAndMouseout);
  }
});
