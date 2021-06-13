import BezierEasing from "/helpers/BezierEasing.js";

// eslint-disable-next-line max-lines-per-function
export const clickable = ({ node, circle }, getCircle) => ({
  onClick(handler) {
    // We indicate that a pendulum (really just the circle) becomes clickable
    // by pulsing the circle
    const pulsingCircle = drawPulsingCircle(node, circle.node, getCircle);
    configurePulseAnimation(pulsingCircle);

    const toggleFill = isFilled => {
      circle.node.style.fill = isFilled ? "currentcolor" : "transparent";
      if (isFilled) {
        circle.node.style.outline = "none";
      }
    };
    const fill = toggleFill.bind(this, true);
    const unfill = toggleFill.bind(this, false);

    circle.onClickOnce(fill, unfill, () => {
      pulsingCircle.node.remove();
      handler();
    });
  }
});

function drawPulsingCircle(groupNode, originalCircleNode, getCircle) {
  const cx = originalCircleNode.getAttribute("cx");
  const cy = originalCircleNode.getAttribute("cy");
  const radius = originalCircleNode.getAttribute("r");
  const circle = getCircle(cx, cy, radius);
  circle.node.setAttribute("transform", originalCircleNode.getAttribute("transform"));
  circle.node.setAttribute("stroke-opacity", 0);
  circle.stroke();
  circle.node.style.pointerEvents = "none";
  groupNode.appendChild(circle.node);
  return circle;
}

function configurePulseAnimation(circle) {
  const radius = circle.node.getAttribute("r");
  const keyTimes = "0; 0.7; 1";
  const dur = 2.2;
  const begin = "0s";
  const pulseEasing = new BezierEasing(0.25, 1, 0.5, 1);

  circle.animateAttribute("r", {
    begin,
    dur,
    repeatCount: "indefinite",
    values: `${radius}; ${radius}; ${radius * 1.7}`,
    calcMode: "spline",
    keySplines: `${BezierEasing.linear.smilString}; ${pulseEasing.smilString}`,
    keyTimes
  });

  circle.animateAttribute({ type: "xml", name: "stroke-opacity" }, {
    begin,
    dur,
    values: "0; 1; 0",
    repeatCount: "indefinite",
    keyTimes
  });
}
