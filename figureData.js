export const directives = {
  TYPE: "TYPE",
  PAUSE: "PAUSE"
};

/* eslint-disable id-length */
const figures = {
  14: {
    a11yDescription: "A line spiralling upwards along a the time axis in a 3-dimensional coordinate system (the space-time continuum).",
    poetry: `I return and sense,
things are not the same as before,
but feel had I stayed,
everything would likely seem the same.`,
    typingDirectives: [
      [directives.TYPE, { charactersPerSecond: 100, numberOfCharacters: 16 }],
      [directives.PAUSE, { durationMS: 3000 }],
      [directives.TYPE, { charactersPerSecond: 50, numberOfCharacters: 28 }]
    ]
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
