import { Line, Circle, createSVGElement } from "../../SVGShapes/SVGShapes.js";
import { renderScanLinePatternDef } from "../../ScanLines.js";

const pendulumCircleScanLinesID = "pendulum-circle-scan-lines";

export default function PendulumArm(anchorPoint, initialAngle, length, radius) {
  const groupNode = createSVGElement("g");

  const arm = drawArm(anchorPoint, initialAngle, length);
  groupNode.appendChild(arm.node);

  const circle = drawEndOfArmCircle(length, anchorPoint, initialAngle, radius);
  groupNode.appendChild(circle.node);

  const self = { node: groupNode, arm, circle };

  return Object.assign(
    self,
    swingable(self, anchorPoint, initialAngle),
    clickable(self)
  );
}

function drawArm(anchorPoint, rotationAngle, length) {
  const arm = getDownwardArm(anchorPoint, length);
  addRotation(arm.node, rotationAngle, anchorPoint);
  return arm;
}

function addRotation(node, angle, anchorPoint) {
  node.setAttribute(
    "transform",
    `rotate(${angle} ${anchorPoint.x} ${anchorPoint.y})`
  );
}

function drawEndOfArmCircle(armLength, anchorPoint, rotationAngle, radius) {
  const circle = new Circle(anchorPoint.x, anchorPoint.y + armLength + radius, radius);
  circle.stroke();
  addRotation(circle.node, rotationAngle, anchorPoint);
  return circle;
}

function getDownwardArm(anchorPoint, length) {
  return new Line(
    anchorPoint,
    { x: anchorPoint.x, y: anchorPoint.y + length }
  );
}

const swingable = ({ arm, circle }, anchorPoint, initialAngle) => ({
  configureSwingAnimation(totalSwings, easing, durationSec) {
    const angleChangeStep = initialAngle / (totalSwings - 1);
    const rotationParams = getSwingingRotationParameters(anchorPoint, totalSwings, angleChangeStep, easing, durationSec);
    arm.animateTransform("rotate", rotationParams);
    circle.animateTransform("rotate", rotationParams);

    this._angleChangeStep = angleChangeStep;
    this._initialAngle = initialAngle;
    this._durationMS = durationSec * 1000;
  },

  beginSwinging({
    atFirstAmplitude = () => {},
    justBeforeEachSubsequentPeriod = () => {},
    atEachSubsequentPeriod = () => {},
    justAfterEachSubsequentPeriod = () => {}
  }) {
    arm.beginAnimation();
    circle.beginAnimation();

    setTimeout(() => {
      const angleAtFirstAmplitude = (this._initialAngle - this._angleChangeStep) * -1;
      atFirstAmplitude(angleAtFirstAmplitude);

      setInterval(justBeforeEachSubsequentPeriod, this._durationMS * 2 - 200);
      setInterval(atEachSubsequentPeriod, this._durationMS * 2);
      setInterval(justAfterEachSubsequentPeriod, this._durationMS * 2 + 200);
    }, this._durationMS);
  }
});

function getSwingingRotationParameters(anchorPoint, totalSwings, angleChangeStep, easing, durationSec) {
  const rotationValue = deg => `${deg} ${anchorPoint.x} ${anchorPoint.y}`;
  const swingAngle = swingIndex => angleChangeStep * (totalSwings - (swingIndex + 1));

  const rotationValues = Array(totalSwings).fill().map((_, swingIndex) => {
    const mirroringFactor = swingIndex % 2 == 0 ? 1 : -1;
    return rotationValue(swingAngle(swingIndex) * mirroringFactor);
  });

  const times = Array(totalSwings).fill().map((value, index) => {
    return 0 + (1 / (totalSwings - 1) * index);
  });

  return {
    values: rotationValues.join("; "),
    keyTimes: times.join("; "),
    calcMode: "spline",
    keySplines: Array(totalSwings - 1).fill(easing).join("; "),
    dur: totalSwings * durationSec,
    begin: "indefinite",
    repeatCount: "1",
    fill: "freeze"
  };
}


const clickable = ({ node, circle }) => ({
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
    defineHoverScanLinePattern(node, circle.node);

    circle.node.style.cursor = "pointer";

    const toggleFill = (isFilled) => {
      circle.node.style.fill = isFilled ? `url(#${pendulumCircleScanLinesID})` : "transparent";
    }
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
  circle.stroke();
  circle.node.style.pointerEvents = "none";
  groupNode.appendChild(circle.node);
  return circle;
}

function configurePulseAnimation(circle) {
  const radius = circle.node.getAttribute("r");
  const keyTimes = "0; 0.3; 1";
  const dur = 2.2;
  const begin = "2s;"
  const pulseEasing = ".25 1 .5 1";

  circle.animateAttribute("r", {
    begin,
    dur,
    repeatCount: "indefinite",
    values: `${radius}; ${radius * 1.7}; ${radius}`,
    calcMode: "spline",
    keySplines: `${pulseEasing}; 0 0 1 1`,
    keyTimes
  });

  circle.animateAttribute({ type: "xml", name: "stroke-opacity" }, {
    begin,
    dur,
    values: "1; 0; 0",
    repeatCount: "indefinite",
    keyTimes
  });
}

function defineHoverScanLinePattern(groupNode, circleNode) {
  const defs = createSVGElement("defs");

  const color = getComputedStyle(groupNode).getPropertyValue("--color-text-light");
  defs.innerHTML = renderScanLinePatternDef(pendulumCircleScanLinesID, color);

  // Since the circle is rotated, the pattern fill also appears rotated, and not aligned
  // to the rest of the scanlines on the page. This applies a rotation to the pattern that
  // is opposite of what the current circle rotation is.
  let rotation = 0;
  if (circleNode.transform && circleNode.transform.animVal && circleNode.transform.animVal[0]) {
    rotation = circleNode.transform.animVal[0].angle;
  }
  defs.querySelector("pattern").setAttribute("patternTransform", `rotate(${rotation * -1})`);

  groupNode.appendChild(defs);
}