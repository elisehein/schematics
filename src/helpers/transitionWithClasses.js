
export default function transitionWithClasses(node, classNames, onDone = () => {}) {
  classNames.forEach(name => node.classList.add(name));

  waitForAnimations(node, () => {
    classNames.forEach(name => node.classList.remove(name));
    onDone();
  });
}

export function waitForAnimations(node, onDone) {
  const checkTarget = event => {
    if (event.target !== node) {
      return;
    }

    node.removeEventListener("animationend", checkTarget);
    node.removeEventListener("transitionend", checkTarget);
    onDone();
  };

  // the classes added may or may not trigger transitions/animations;
  // we don't want to depend on that.
  if (node.getAnimations().length > 0) {
    node.addEventListener("animationend", checkTarget);
    node.addEventListener("transitionend", checkTarget);
  } else {
    onDone();
  }
}
