import Figure14 from "./Figure14.js";
import Figure18 from "./Figure18/Figure18.js";
import Figure36 from "./Figure36.js";
import Figure43 from "./Figure43.js";

const copy = {
  14: {
    a11yDescription: "A line spiralling upwards along a the time axis in a 3-dimensional coordinate system.",
    poetry: `I return and sense,
    things are not the same as before,
    but feel had I stayed,
    everything would likely seem the same.`
  },
  18: {
    a11yDescription: "A flow diagram for love.",
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
      el = new Figure14;
      break;
    case 18:
      el = new Figure18;
      break
    case 36:
      el = new Figure36;
      break
    case 43:
      el = new Figure43;
      break
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