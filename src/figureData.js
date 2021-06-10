import Figure14Diagram from "./components/Diagram/Figure14Diagram.js";
import Figure18Diagram from "./components/Diagram/Figure18Diagram/Figure18Diagram.js";
import Figure36Diagram from "./components/Diagram/Figure36Diagram/Figure36Diagram.js";
import Figure40Diagram from "./components/Diagram/Figure40Diagram.js";
import Figure43Diagram from "./components/Diagram/Figure43Diagram.js";

export const directives = {
  TYPE: "TYPE",
  PAUSE: "PAUSE"
};

const figures = {
  14: {
    a11yDescription: "A line spiralling upwards along a the time axis in a 3-dimensional coordinate system (the space-time continuum).",
    poetry: `[TYPE:NORMAL]I return [TYPE:FAST][PAUSE:SHORT]and sense,
[PAUSE:LONG]things [PAUSE:SHORT]are\n[PAUSE:gMEDIUM]not [TYPE:SLOWEST]the same[TYPE:SLOW] as[TYPE:NORMAL] before,[PAUSE:MEDIUM]
but feel[PAUSE:SHORT] had I stayed,
[TYPE:SLOWEST][PAUSE:LONG]every[TYPE:SLOW]thing\n[PAUSE:MEDIUM]would likely[TYPE:NORMAL][PAUSE:MEDIUM] seem[PAUSE:MEDIUM] the same.`
  },
  18: {
    a11yDescription: "A flow diagram for love. Good? Yes. More? Yes. Do it.",
    poetry: "[TYPE:NORMAL]I will send [PAUSE:SHORT]you flowers[PAUSE:MEDIUM], [TYPE:SLOWEST]pearls[PAUSE:LONG],\n[TYPE:NORMAL]letters[TYPE:FAST][PAUSE:SHORT] written in[TYPE:SLOW] ink."
  },
  36: {
    a11yDescription: "A swinging pendulum.",
    poetry: `[TYPE:SLOW]I miss [PAUSE:SHORT]you.[PAUSE:LONG]
[TYPE:NORMAL]I would\n[TYPE:SLOW]reach out[PAUSE:MEDIUM]\nand[PAUSE:MEDIUM]\n[TYPE:SLOWEST]touch[TYPE:SLOW][PAUSE:SHORT] you,[PAUSE:LONG]
[TYPE:FAST]if I[TYPE:SLOW]\ncould.`
  },
  40: {
    a11yDescription: "Don't remember",
    poetry: "Alone."
  },
  43: {
    a11yDescription: "A rotating Necker cube.",
    poetry: "[TYPE:NORMAL]Dream [TYPE:SLOW][PAUSE:SHORT]little one[PAUSE:LONG], [TYPE:SLOWEST]dream."
  }
};

export function getDiagram(num, preview = false) {
  switch (num) {
    case 14:
      return new Figure14Diagram(preview);
    case 18:
      return new Figure18Diagram(preview);
    case 36:
      return new Figure36Diagram(preview);
    case 40:
      return new Figure40Diagram(preview);
    case 43:
      return new Figure43Diagram(preview);
    default:
      throw new Error(`No diagram element specified for figure ${num}.`);
  }
}

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
  // eslint-disable-next-line id-length
  .sort((a, b) => a - b);
