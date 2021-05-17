export const directives = {
  TYPE: "TYPE",
  PAUSE: "PAUSE"
};

/* eslint-disable id-length */
const figures = {
  14: {
    a11yDescription: "A line spiralling upwards along a the time axis in a 3-dimensional coordinate system (the space-time continuum).",
    poetry: `[TYPE:NORMAL]I return [PAUSE:SHORT]and sense,
[PAUSE:LONG]things are not the same as before,
[PAUSE:LONG][TYPE:FAST]but feel had I stayed,
[PAUSE:MEDIUM]everything would likely seem the same.`
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

export function getPoetry(num) {
  return figures[num].poetry;
}

export function getA11yDescription(num) {
  return figures[num].a11yDescription;
}

export function getTypingDirectives(num) {
  return figures[num].typingDirectives;
}

export function figureExists(num) {
  return Object.keys(figures).includes(String(num));
}

export const orderedFigures = Object
  .keys(figures)
  .map(Number)
  .sort((a, b) => a - b);
