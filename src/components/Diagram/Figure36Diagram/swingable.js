export const swingable = ({ arm, circle }, anchorPoint, initialAngle) => ({
  swing(totalSwings, easing, duration, { onSwing }) {
    const angleChangeStep = initialAngle / totalSwings;

    const baseParamsForSwing = index => ({
      values: animationRotationValues(index, anchorPoint, totalSwings, angleChangeStep),
      keyTimes: "0; 1",
      calcMode: "spline",
      keySplines: easing.smilString,
      dur: duration.s,
      begin: index == 0 ? "indefinite" : `swinganimation${index - 1}.end`,
      fill: "freeze"
    });

    Array(totalSwings).fill().forEach((_, index) => {
      addAnimationForSwing(index, { arm, circle }, baseParamsForSwing, { onSwing });
    });

    arm.beginAnimation();
    circle.beginAnimation();
  }
});

function addAnimationForSwing(index, { arm, circle }, baseParamsForSwing, { onSwing }) {
  const swingParams = baseParamsForSwing(index);
  swingParams.id = `swinganimation${index}`;
  arm.animateTransform("rotate", swingParams);
  arm.getTargetAnimationNode(swingParams.id).addEventListener("endEvent", () => {
    const rotationAngleAtEndOfSwing = swingParams.values.split(";")[1].split(" ")[0];
    onSwing(index, rotationAngleAtEndOfSwing);
  });

  // The arm and the circle animation nodes are both triggered by the *arm* animation end events.
  // Since they happen in sync anyway, no need to keep track of two sets of IDs
  swingParams.id = "";
  circle.animateTransform("rotate", swingParams);
}

function animationRotationValues(swingIndex, anchorPoint, totalSwings, angleChangeStep) {
  const rotationValue = deg => `${deg} ${anchorPoint.x} ${anchorPoint.y}`;
  const swingAngle = index => angleChangeStep * (totalSwings - index);

  return [swingIndex, swingIndex + 1].map(index => {
    const mirroringFactor = index % 2 == 0 ? 1 : -1;
    return rotationValue(swingAngle(index) * mirroringFactor);
  }).join(";");
}
