/* eslint-disable max-len */
export const directives = {
  TYPE: "TYPE",
  PAUSE: "PAUSE"
};

const figures = {
  14: {
    a11yDescription: "A line spiralling upwards along a the time axis in a 3-dimensional coordinate system.",
    a11yThumbnailDescription: "A spiral making three loops.",
    poetry: `[TYPE:NORMAL]I return [TYPE:FAST][PAUSE:SHORT]and sense,
[PAUSE:LONG]things [PAUSE:SHORT]are\n[PAUSE:MEDIUM]not [TYPE:SLOWEST]the same[TYPE:SLOW] as[TYPE:NORMAL] before,[PAUSE:MEDIUM]
but feel[PAUSE:SHORT] had I stayed,
[TYPE:SLOWEST][PAUSE:LONG]every[TYPE:SLOW]thing\n[PAUSE:MEDIUM]would likely[TYPE:NORMAL][PAUSE:MEDIUM] seem[PAUSE:MEDIUM] the same.`
  },
  18: {
    a11yDescription: "A flow diagram for love. Good? Yes. More? Yes. Do it.",
    a11yThumbnailDescription: "A box with the question \"Good?\"",
    poetry: "[TYPE:NORMAL]I will send [PAUSE:SHORT]you flowers[PAUSE:MEDIUM], [TYPE:SLOWEST]pearls[PAUSE:LONG],\n[TYPE:NORMAL]letters[TYPE:FAST][PAUSE:SHORT] written in[TYPE:SLOW] ink."
  },
  20: {
    a11yDescription: "An illustration of the propagation of sound waves across arrays of vertical lines.",
    a11yThumbnailDescription: "A row of parallel vertical lines that cluster closes together in the middle.",
    poetry: `[TYPE:NORMAL]You [TYPE:SLOW]lay out [TYPE:NORMAL][PAUSE:MEDIUM]some newspaper.
[TYPE:SLOW][PAUSE:LONG]We lie [PAUSE:SHORT]on[TYPE:FAST] it.
[TYPE:SLOWEST][PAUSE:LONG]The [TYPE:NORMAL]fairy[TYPE:SLOW]tale music,
[TYPE:NORMAL][PAUSE:SHORT]drifts [PAUSE:MEDIUM]through [TYPE:SLOWEST]the [TYPE:NORMAL]trees.`
  },
  36: {
    a11yDescription: "A swinging pendulum.",
    a11yThumbnailDescription: "A pendulum with two arms.",
    poetry: `[TYPE:SLOW]I miss [PAUSE:SHORT]you.[PAUSE:LONG]
[TYPE:NORMAL]I would\n[TYPE:SLOW]reach out[PAUSE:MEDIUM]\nand[PAUSE:MEDIUM]\n[TYPE:SLOWEST]touch[TYPE:SLOW][PAUSE:SHORT] you,[PAUSE:LONG]
[TYPE:FAST]if I[TYPE:SLOW]\ncould.`
  },
  42: {
    a11yDescription: "A scatter plot with discrete x-axis groupings that gets denser towarsds the bottom right.",
    a11yThumbnailDescription: "A cut-out from a scatter plot.",
    poetry: "[TYPE:SLOW]Si[TYPE:SLOWEST]len[TYPE:NORMAL]ce."
  },
  43: {
    a11yDescription: "A rotating Necker cube.",
    a11yThumbnailDescription: "A 3D cube",
    poetry: "[TYPE:NORMAL]Dream [TYPE:SLOW][PAUSE:SHORT]little one[PAUSE:LONG], [TYPE:SLOWEST]dream."
  }
};

export function getPoetry(num) {
  return figures[num].poetry;
}

export function getA11yDescription(num) {
  return figures[num].a11yDescription;
}

export function getA11yThumbnailDescription(num) {
  return figures[num].a11yThumbnailDescription;
}

export function figureExists(num) {
  return Object.keys(figures).includes(String(num));
}

export const orderedFigures = Object
  .keys(figures)
  .map(Number)
  // eslint-disable-next-line id-length
  .sort((a, b) => a - b);
