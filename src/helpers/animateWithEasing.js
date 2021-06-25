export default function animateWithEasing(
  duration, easing, animationFrameHandler, { onDone } = {}
) {
  let start;
  let ref;
  let fractionOfAnimationDone;

  const step = timestamp => {
    if (!start) {
      start = timestamp;
    }

    const elapsed = timestamp - start;
    const interval = elapsed / duration.ms;
    fractionOfAnimationDone = easing.pointAlongCurve(interval).y;

    animationFrameHandler(fractionOfAnimationDone);

    if (elapsed < duration.ms) {
      ref = window.requestAnimationFrame(step);
    } else if (onDone) {
      onDone();
    }
  };

  ref = window.requestAnimationFrame(step);
  return () => {
    window.cancelAnimationFrame(ref);
    return fractionOfAnimationDone;
  };
}
