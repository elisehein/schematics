import Figure14 from "./Figure14.js";

const copy = {
  14: {
    a11yDescription: "A line spiralling upwards along a the time axis in a 3-dimensional coordinate system.",
    poetry: `I return and sense,
    things are not the same as before,
    but feel had I stayed,
    everything would likely seem the same.`
  }
};

export default function getFigureFactory(num) {
  return (figureNode) => {
    switch (num) {
      case 14:
        return new Figure14(figureNode, copy[num].a11yDescription, copy[num].poetry);
      default:
        throw `Figure${num} isn't defined.`;
    }
  }
}
