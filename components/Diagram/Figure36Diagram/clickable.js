import { Circle } from "../../SVGShapes/SVGShapes.js";
import BezierEasing from "/helpers/BezierEasing.js";

export const clickable = ({ node, circle }) => ({
  onClick(handler) {
    // We indicate that a pendulum (really just the circle) becomes clickable
    // by pulsing the circle
    const pulsingCircle = drawPulsingCircle(node, circle.node);
    configurePulseAnimation(pulsingCircle);

    const removeHoverStyling = this.addHoverStyling();

    circle.node.addEventListener("click", () => {
      removeHoverStyling();
      pulsingCircle.node.remove();
      handler();
    }, { once: true });
  },

  addHoverStyling() {
    circle.node.style.cursor = "pointer";

    const toggleFill = isFilled => {
      circle.node.style.fill = isFilled ? "currentcolor" : "transparent";
    };
    const fill = toggleFill.bind(this, true);
    const unfill = toggleFill.bind(this, false);

    circle.node.addEventListener("mouseover", fill);
    circle.node.addEventListener("mouseleave", unfill);

    return () => {
      unfill();
      circle.node.removeEventListener("mouseover", fill);
      circle.node.removeEventListener("mouseleave", unfill);
      circle.node.style.cursor = "default";
    };
  }
});

function drawPulsingCircle(groupNode, originalCircleNode) {
  const cx = originalCircleNode.getAttribute("cx");
  const cy = originalCircleNode.getAttribute("cy");
  const radius = originalCircleNode.getAttribute("r");
  const circle = new Circle(cx, cy, radius);
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
