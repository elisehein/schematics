export default function animateWithEasing(duration, easing, animationFrameHandler, { onDone } = {}) {
  let start;
  let ref;

  const step = timestamp => {
    if (!start) {
      start = timestamp;
    }

    const elapsed = timestamp - start;
    const interval = elapsed / duration.ms;

    animationFrameHandler(easing.pointAlongCurve(interval).y);

    if (elapsed < duration.ms) {
      ref = window.requestAnimationFrame(step);
    } else if (onDone) {
      onDone();
    }
  };

  ref = window.requestAnimationFrame(step);
  return () => ref;
}
