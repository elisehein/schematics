export default function animateWithEasing(duration, easing, animationFrameHandler, { onDone } = {}) {
  let start;

  const step = timestamp => {
    if (!start) {
      start = timestamp;
    }

    const elapsed = timestamp - start;
    const interval = elapsed / duration.ms;

    animationFrameHandler(easing.pointAlongCurve(interval).y);

    if (elapsed < duration.ms) {
      window.requestAnimationFrame(step);
    } else if (onDone) {
      onDone();
    }
  };

  window.requestAnimationFrame(step);
}
