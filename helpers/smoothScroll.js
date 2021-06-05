/* This is used to scroll the diagram back into view on narrow screens
 * where the typing animation scrolls it out of view.
 * scrollIntoView({ behavior: smooth }) works fine, but it's not supported
 * on Safari, and you cannot control timing.
 */
export default function smoothScroll(node, x, y, durationMS, easing, { onDone } = {}) {
  const initialScrollX = node.scrollLeft;
  const initialScrollY = node.scrollTop;
  const scrollingRight = initialScrollX < x;
  const scrollingDown = initialScrollY < y;
  const totalScrollDistanceX = Math.abs(node.scrollLeft - x);
  const totalScrollDistanceY = Math.abs(node.scrollTop - y);

  let start;

  const step = timestamp => {
    if (start === undefined) {
      start = timestamp;
    }

    const elapsed = timestamp - start;
    const interval = elapsed / durationMS;

    const scrollDistanceXCoveredThisAnimationFrame = totalScrollDistanceX * easing.pointAlongCurve(interval).y;
    const scrollDistanceYCoveredThisAnimationFrame = totalScrollDistanceY * easing.pointAlongCurve(interval).y;

    node.scrollLeft = (
      scrollingRight
      ? initialScrollX + scrollDistanceXCoveredThisAnimationFrame
      : initialScrollX - scrollDistanceXCoveredThisAnimationFrame
    );
    node.scrollTop = (
      scrollingDown
      ? initialScrollY + scrollDistanceYCoveredThisAnimationFrame
      : initialScrollY - scrollDistanceYCoveredThisAnimationFrame
    );

    if (elapsed < durationMS) {
      window.requestAnimationFrame(step);
    } else if (onDone !== undefined) {
      onDone();
    }
  };

  window.requestAnimationFrame(step);
}
