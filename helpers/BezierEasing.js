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
