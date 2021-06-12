export default function Duration({ seconds, milliseconds }) {
  if (milliseconds && seconds && milliseconds !== seconds * 1000) {
    throw new Error();
  }

  if (!milliseconds && !seconds) {
    throw new Error();
  }

  return Object.freeze({
    ms: milliseconds || seconds * 1000,
    s: seconds || milliseconds / 1000
  });
}
