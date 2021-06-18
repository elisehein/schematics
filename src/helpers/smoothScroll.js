import animateWithEasing from "./animateWithEasing.js";

/* This is used to scroll the diagram back into view on narrow screens
 * where the typing animation scrolls it out of view.
 * scrollIntoView({ behavior: smooth }) works fine, but it's not supported
 * on Safari, and you cannot control timing.
 */
export default function smoothScroll(node, x, y, duration, easing, { onDone } = {}) {
  const initialScrollX = node.scrollLeft;
  const initialScrollY = node.scrollTop;

  if (initialScrollX == x && initialScrollY == y) {
    onDone && onDone();
    return;
  }

  const scrollingRight = initialScrollX < x;
  const scrollingDown = initialScrollY < y;
  const totalScrollDistanceX = Math.abs(node.scrollLeft - x);
  const totalScrollDistanceY = Math.abs(node.scrollTop - y);

  animateWithEasing(duration, easing, fractionOfAnimationDone => {
    const scrollDistanceXCoveredThisAnimationFrame = totalScrollDistanceX * fractionOfAnimationDone;
    const scrollDistanceYCoveredThisAnimationFrame = totalScrollDistanceY * fractionOfAnimationDone;

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
  }, { onDone });
}
