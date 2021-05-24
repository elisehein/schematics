export default function BezierEasing(x1, y1, x2, y2) {
  const cssString = `cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})`;
  const smilString = `${x1} ${y1} ${x2} ${y2}`;

  return Object.freeze({
    cssString,
    smilString
  });
}

BezierEasing.fromCSSString = cssString => (
  new BezierEasing(...cssStringToPoints(cssString))
);

BezierEasing.fromSMILString = smilString => (
  new BezierEasing(...smilStringToPoints(smilString))
);

function smilStringToPoints(smilString) {
  return smilString.split(" ").map(parseFloat);
}

function cssStringToPoints(cssString) {
  const regex = /cubic-bezier\(\s?(.*),\s?(.*),\s?(.*),\s?(.*)\s?\)/g;
  const [_, x1, y1, x2, y2] = regex.exec(cssString);
  return [x1, y1, x2, y2].map(parseFloat);
}

BezierEasing.linear = new BezierEasing(0, 0, 1, 1);

BezierEasing.easeInCubic = new BezierEasing(0.32, 0, 0.67, 0);
BezierEasing.easeInCirc = new BezierEasing(0.55, 0, 1, 0.45);
BezierEasing.easeInSine = new BezierEasing(0.12, 0, 0.39, 0);

BezierEasing.easeOutSine = new BezierEasing(0.61, 1, 0.88, 1);
BezierEasing.easeOutCubic = new BezierEasing(0.33, 1, 0.68, 1);

BezierEasing.easeInOutSine = new BezierEasing(0.37, 0, 0.63, 1);
