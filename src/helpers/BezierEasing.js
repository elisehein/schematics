export default function BezierEasing(x1, y1, x2, y2) {
  const cssString = `cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})`;
  const smilString = `${x1} ${y1} ${x2} ${y2}`;

  return Object.freeze({
    cssString,
    smilString,
    pointAlongCurve: pointAlongCurve.bind(null, { x: x1, y: y1 }, { x: x2, y: y2 })
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

// https://stackoverflow.com/questions/34681457/html5-canvas-bezier-curve-get-all-the-points
// Interval is a number between 0 and 1 that defines how far along the curve the point is
function pointAlongCurve(controlPoint1, controlPoint2, interval) {
  const startPoint = { x: 0, y: 0 };
  const endPoint = { x: 1, y: 1 };
  return {
    x: cubicHelper(interval, startPoint.x, controlPoint1.x, controlPoint2.x, endPoint.x),
    y: cubicHelper(interval, startPoint.y, controlPoint1.y, controlPoint2.y, endPoint.y)
  };
}

// eslint-disable-next-line id-length
function cubicHelper(T, a, b, c, d) {
  const t2 = T * T;
  const t3 = t2 * T;
  return a + (-a * 3 + T * (3 * a - a * T)) * T + (3 * b + T * (-6 * b + b * 3 * T)) * T + (c * 3 - c * 3 * T) * t2 + d * t3;
};

BezierEasing.linear = new BezierEasing(0, 0, 1, 1);

BezierEasing.easeInCubic = new BezierEasing(0.32, 0, 0.67, 0);
BezierEasing.easeInCirc = new BezierEasing(0.55, 0, 1, 0.45);
BezierEasing.easeInSine = new BezierEasing(0.12, 0, 0.39, 0);

BezierEasing.easeOutSine = new BezierEasing(0.61, 1, 0.88, 1);
BezierEasing.easeOutCubic = new BezierEasing(0.33, 1, 0.68, 1);

BezierEasing.easeInOutSine = new BezierEasing(0.37, 0, 0.63, 1);
