export default function animateWithEasing(durationMS, easing, animationFrameHandler, { onDone } = {}) {
  let start;

  const step = timestamp => {
    if (start === undefined) {
      start = timestamp;
    }

    const elapsed = timestamp - start;
    const interval = elapsed / durationMS;

    animationFrameHandler(easing.pointAlongCurve(interval).y);

    if (elapsed < durationMS) {
      window.requestAnimationFrame(step);
    } else if (onDone !== undefined) {
      onDone();
    }
  };

  window.requestAnimationFrame(step);
}
