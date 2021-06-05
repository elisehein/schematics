import { createSVGElement } from "../../SVGShapes/SVGShapes.js";
import { getArcPathD } from "/helpers/arcCalculations.js";
import animateWithEasing from "/helpers/animateWithEasing.js";
import { runActionsSequentially, waitBeforeNextAction } from "/helpers/sequentialActionRunning.js";

const animationSteps = 18;

export default function PendulumTrajectoryArrow(shapeFactory, anchorPoint, radius, angles) {
  const g = createSVGElement("g");

  const arc = shapeFactory.getPath();
  arc.addArrowHead();
  arc.stroke();
  arc.dash(5);

  g.appendChild(arc.node);

  const self = { node: g, arc };
  return Object.assign(
    self,
    appearingWithoutAnimation(self, anchorPoint, radius, angles),
    appearingInSteps(self, anchorPoint, radius, angles),
    disappearingWithEasing(self, anchorPoint, radius, angles)
  )
}

const appearingWithoutAnimation = ({ arc }, anchorPoint, radius, finalAngles) => ({
  appearWithoutAnimation() {
    const d = getArcPathD({ radius, ...anchorPoint }, finalAngles);
    arc.node.setAttribute("d", d);
  }
});

const appearingInSteps = ({ arc }, anchorPoint, radius, finalAngles) => ({
  appearInSteps(durationMS, timerManager, { onDone }) {
    const arcLength  = finalAngles.endAngle - finalAngles.startAngle
    const arcLengthForSingleStep = arcLength / animationSteps;
    const singleStepDuration = durationMS / animationSteps;

    const setArrowArcStartAngle = startAngle => {
      return (objectWithDoneHandler) => {
        const d = getArcPathD({ radius, ...anchorPoint }, { startAngle, endAngle: finalAngles.endAngle });
        arc.node.setAttribute("d", d);
        objectWithDoneHandler.onDone();
      }
    }

    const steppedArrowIncrementActions = emptyArrayOfLength(animationSteps).map((_, index) => [
      waitBeforeNextAction(singleStepDuration, timerManager),
      setArrowArcStartAngle(finalAngles.endAngle - ((index + 1) * arcLengthForSingleStep)),
    ]).flat();

    runActionsSequentially(steppedArrowIncrementActions, onDone);
  }
});

/* We cannot use an overlay shape to make it look like the arrow is disappearing,
 * because a black overlay shape is still visible if a drop-shadow filter is applied
 * to the whole diagram.
 * We also cannot use a CSS/SMIL animation, because there's no way in either case to animate
 * an arc appearing/disappearing.
 * Instead, we are redrawing a shorter and shorter arc manually using getAnimationFrame()
 */
const disappearingWithEasing = ({ arc, node }, anchorPoint, radius, angles, ) => ({
  disappearWithEasing(easing, durationSec) {
    const durationMS = durationSec * 1000;

    const totalAnglesCovered = angles.startAngle - angles.endAngle;
    const startAngle = angles.startAngle;
    const originalArcLength = arc.getLength();

    animateWithEasing(durationMS, easing, fractionOfAnimationDone => {
      const anglesCoveredThisAnimationFrame = totalAnglesCovered * fractionOfAnimationDone;
      const endAngle = Math.max(angles.startAngle, angles.endAngle + anglesCoveredThisAnimationFrame);
      const d = getArcPathD({ radius, ...anchorPoint }, { startAngle, endAngle });
      this.updateArcStyle(arc, d, originalArcLength, fractionOfAnimationDone >= 0.8);
    }, { onDone: () => {
      node.remove();
    }});
  },

  updateArcStyle(arc, d, originalArcLength, almostDisappeared) {
    arc.node.setAttribute("d", d);

    // Adjust stroke-dashoffset so that the dashes begin at the original path start point.
    // This prevents the dashes from moving during the animation.
    arc.node.style.strokeDashoffset = (originalArcLength - arc.getLength());

    if (almostDisappeared) {
      arc.removeArrowHead(); // Remove slightly before the full path is hidden to make it look smoother
    }
  }
});


const emptyArrayOfLength = length => Array(length).fill();
