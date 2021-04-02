import Figure14 from "./Figure14.js";
import Figure18 from "./Figure18.js";

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
  }
};

export function getDiagramElement(num) {
  const a11yDescription = getA11yDescription(num);
  let el;

  switch (num) {
    case 14:
      el = new Figure14;
      break;
    case 18:
      el = new Figure18;
      break
  }

  el.a11yDescription = getA11yDescription(num);
  return el;
}

// How to pass this to Figure14 constructor?
export function getA11yDescription(num) {
  return copy[num].a11yDescription;
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