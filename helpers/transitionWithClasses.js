
export default function transitionWithClasses(node, classNames, onDone = () => {}) {
  classNames.forEach(name => node.classList.add(name));

  const stopTransitioning = event => {
    if (event && event.target !== node) {
      return;
    }

    classNames.forEach(name => node.classList.remove(name));
    node.removeEventListener("animationend", stopTransitioning);
    node.removeEventListener("transitionend", stopTransitioning);
    onDone();
  };

  // the classes added may or may not trigger transitions/animations;
  // we don't want to depend on that.
  if (node.getAnimations().length > 0) {
    node.addEventListener("animationend", stopTransitioning);
    node.addEventListener("transitionend", stopTransitioning);
  } else {
    stopTransitioning();
  }
}
