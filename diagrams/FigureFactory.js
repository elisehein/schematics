/* eslint-disable id-length */
import Figure14Diagram from "./Figure14Diagram.js";
import Figure18Diagram from "./Figure18Diagram/Figure18Diagram.js";
import Figure36Diagram from "./Figure36Diagram.js";
import Figure43Diagram from "./Figure43Diagram.js";

const copy = {
  14: {
    a11yDescription: "A line spiralling upwards along a the time axis in a 3-dimensional coordinate system (the space-time continuum).",
    poetry: `I return and sense,
    things are not the same as before,
    but feel had I stayed,
    everything would likely seem the same.`
  },
  18: {
    a11yDescription: "A flow diagram for love. Good? Yes. More? Yes. Do it.",
    poetry: "I will send you flowers, pearls, letters written in ink."
  },
  36: {
    a11yDescription: "A swinging pendulum.",
    poetry: `I miss you.
    I would reach out and touch you,
    if I could.`
  },
  43: {
    a11yDescription: "A rotating Necker cube.",
    poetry: "Dream little one, dream."
  }
};

export function getDiagramElement(num) {
  let el;

  switch (num) {
    case 14:
      el = new Figure14Diagram();
      break;
    case 18:
      el = new Figure18Diagram();
      break
    case 36:
      el = new Figure36Diagram();
      break
    case 43:
      el = new Figure43Diagram();
      break
    default:
      throw new Error(`No diagram element specified for figure ${num}.`);
  }

  el.a11yDescription = copy[num].a11yDescription;
  return el;
}

export function getPoetry(num) {
  return copy[num].poetry;
}

export function figureExists(num) {
  return Object.keys(copy).includes(String(num));
}

export const orderedFigures = Object
  .keys(copy)
  .map(Number)
  .sort((a, b) => a - b);
