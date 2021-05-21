import { Path, createSVGElement } from "../../SVGShapes/SVGShapes.js";
import { getArcPathD } from "/helpers/arcCalculations.js";
import { runActionsSequentially, waitBeforeNextAction } from "/helpers/sequentialActionRunning.js";

const animationSteps = 18;

export default function PendulumTrajectoryArrow(anchorPoint, radius, angles, registerMarker) {
  const g = createSVGElement("g");

  const arc = new Path();
  arc.addArrowHead(registerMarker);
  arc.stroke();
  arc.dash(5);

  g.appendChild(arc.node);

  const self = { node: g, arcNode: arc.node };
  return Object.assign(
    self,
    appearingInSteps(self, anchorPoint, radius, angles),
    disappearingWithEasing(self, anchorPoint, radius, angles)
  )
}

const appearingInSteps = ({ arcNode }, anchorPoint, radius, finalAngles) => ({
  appearInSteps(durationMS, { onDone }) {
    const arcLength  = finalAngles.endAngle - finalAngles.startAngle
    const arcLengthForSingleStep = arcLength / animationSteps;
    const singleStepDuration = durationMS / animationSteps;

    const setArrowArcStartAngle = startAngle => {
      return (objectWithDoneHandler) => {
        const d = getArcPathD({ radius, ...anchorPoint }, { startAngle, endAngle: finalAngles.endAngle });
        arcNode.setAttribute("d", d);
        objectWithDoneHandler.onDone();
      }
    }

    const steppedArrowIncrementActions = emptyArrayOfLength(animationSteps).map((_, index) => [
      waitBeforeNextAction(singleStepDuration),
      setArrowArcStartAngle(finalAngles.endAngle - ((index + 1) * arcLengthForSingleStep)),
    ]).flat();

    runActionsSequentially(steppedArrowIncrementActions, onDone);
  }
});

const disappearingWithEasing = ({ arcNode, node }, anchorPoint, radius, angles) => ({
  disappearWithEasing(easing, durationSec) {
    const overlayAngles = {
      startAngle: angles.startAngle - 10,
      endAngle: angles.endAngle + 10
    };

    const overlayArc = new Path(getArcPathD({ radius, ...anchorPoint }, overlayAngles))
    overlayArc.stroke(8, "var(--color-page-bg)");
    node.appendChild(overlayArc.node);

    const cssEasing = `cubic-bezier(${easing.split(" ").join(",")})`;
    overlayArc.animateStroke(`${durationSec}s`, cssEasing, () => {
      arcNode.remove();
      overlayArc.node.remove();
    });
  }
});

const emptyArrayOfLength = length => Array(length).fill();
