export default function Duration({ seconds, milliseconds }) {
  if (milliseconds && seconds && milliseconds !== seconds * 1000) {
    throw new Error();
  }

  // eslint-disable-next-line no-undefined
  if (milliseconds == undefined && seconds == undefined) {
    throw new Error();
  }

  if (milliseconds == 0 || seconds == 0) {
    return Object.freeze({ ms: 0, s: 0 });
  }

  return Object.freeze({
    ms: milliseconds || seconds * 1000,
    s: seconds || milliseconds / 1000
  });
}

/* eslint-disable no-extend-native */
export function registerDurationConvenienceInits() {
  Number.prototype.seconds = function() {
    return new Duration({ seconds: this });
  };

  Number.prototype.milliseconds = function() {
    return new Duration({ milliseconds: this });
  };
}
/* eslint-enable no-extend-native */
