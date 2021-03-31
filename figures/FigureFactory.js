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

export default function getFigureFactory(num) {
  return (figureNode) => {
    switch (num) {
      case 14:
        return new Figure14(figureNode, copy[num].a11yDescription, copy[num].poetry);
      case 18:
        return new Figure18(figureNode, copy[num].a11yDescription, copy[num].poetry);
      default:
        throw `Figure${num} isn't defined.`;
    }
  }
}
