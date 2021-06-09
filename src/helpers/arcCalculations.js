export const polarToCartesian = (x, y, radius, angleInDegrees) => {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

  return {
    x: x + (radius * Math.cos(angleInRadians)),
    y: y + (radius * Math.sin(angleInRadians))
  };
}

export const getArcPathD = ({ x, y, radius}, { startAngle, endAngle }) => {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}
