export const directives = {
  TYPE: "TYPE",
  PAUSE: "PAUSE"
};

/* eslint-disable id-length */
const figures = {
  14: {
    a11yDescription: "A line spiralling upwards along a the time axis in a 3-dimensional coordinate system (the space-time continuum).",
    poetry: `[TYPE:NORMAL]I return [TYPE:FAST][PAUSE:SHORT]and sense,
[PAUSE:3000]things [PAUSE:SHORT]are [PAUSE:MEDIUM]not [TYPE:SLOWEST]the same[TYPE:SLOW] as[TYPE:NORMAL] before,[PAUSE:6000]
but feel[PAUSE:SHORT] had I stayed,
[TYPE:SLOWEST][PAUSE:3000]every[TYPE:SLOW]thing [PAUSE:MEDIUM]would likely[TYPE:NORMAL][PAUSE:MEDIUM] seem[PAUSE:MEDIUM] the same.`
  },
  18: {
    a11yDescription: "A flow diagram for love. Good? Yes. More? Yes. Do it.",
    poetry: "[TYPE:NORMAL]I will send [PAUSE:SHORT]you flowers[PAUSE:MEDIUM], [TYPE:SLOWEST]pearls[PAUSE:LONG], [TYPE:NORMAL]letters[TYPE:FAST][PAUSE:SHORT] written in[TYPE:SLOW] ink."
  },
  36: {
    a11yDescription: "A swinging pendulum.",
    poetry: `[TYPE:SLOW]I miss [PAUSE:SHORT]you.[PAUSE:LONG]
[TYPE:NORMAL]I would [TYPE:SLOW]reach out[PAUSE:MEDIUM] and [TYPE:SLOWEST]touch[PAUSE:SHORT] you,[PAUSE:LONG]
[TYPE:FAST]if I[TYPE:SLOW] could.`
  },
  43: {
    a11yDescription: "A rotating Necker cube.",
    poetry: "[TYPE:NORMAL]Dream [TYPE:SLOW][PAUSE:SHORT]little one[PAUSE:LONG], [TYPE:SLOWEST]dream."
  }
};

export function getPoetry(num) {
  return figures[num].poetry;
}

export function getA11yDescription(num) {
  return figures[num].a11yDescription;
}

export function figureExists(num) {
  return Object.keys(figures).includes(String(num));
}

export const orderedFigures = Object
  .keys(figures)
  .map(Number)
  .sort((a, b) => a - b);
