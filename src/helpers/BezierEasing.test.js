/* eslint-disable max-lines-per-function */
import BezierEasing from "./BezierEasing.js";

describe("BezierEasing", () => {
  describe("when initialised with points", () => {
    let sut;

    beforeEach(() => {
      const easeOutSine = [0.61, 1, 0.88, 1];
      sut = new BezierEasing(...easeOutSine);
    });

    test("provides a valid CSS string", () => {
      expect(sut.cssString).toEqual("cubic-bezier(0.61, 1, 0.88, 1)");
    });

    test("provides a valid SMIL string", () => {
      expect(sut.smilString).toEqual("0.61 1 0.88 1");
    });
  });

  describe("when initialised from a CSS string", () => {
    test("provides the correct SMIL string", () => {
      const sut = BezierEasing.fromCSSString("cubic-bezier(0.25, 1, 0.5, 1)");
      expect(sut.smilString).toEqual("0.25 1 0.5 1");
    });

    test("handles missing leading zeros in the CSS string", () => {
      const sut = BezierEasing.fromCSSString("cubic-bezier(0.25, 1, .5, 1)");
      expect(sut.smilString).toEqual("0.25 1 0.5 1");
    });

    test("handles whitespace variations in the CSS string", () => {
      const sut = BezierEasing.fromCSSString("cubic-bezier( 0.25,1,  .5, 1)");
      expect(sut.smilString).toEqual("0.25 1 0.5 1");
    });

    test("handles negative numbers in the CSS string", () => {
      const sut = BezierEasing.fromCSSString("cubic-bezier(0.36,0, .66, -0.56)");
      expect(sut.smilString).toEqual("0.36 0 0.66 -0.56");
    });

    test("handles negative numbers without leading zeros in the CSS string", () => {
      const sut = BezierEasing.fromCSSString("cubic-bezier(0.36,0, .66, -.56)");
      expect(sut.smilString).toEqual("0.36 0 0.66 -0.56");
    });
  });

  describe("when initialised from a SMIL string", () => {
    test("provides the correct CSS string", () => {
      const sut = BezierEasing.fromSMILString("0.25 1 0.5 1)");
      expect(sut.cssString).toEqual("cubic-bezier(0.25, 1, 0.5, 1)");
    });

    test("handles negative numbers in the SMIL string", () => {
      const sut = BezierEasing.fromSMILString("0.36 0 0.66 -0.56)");
      expect(sut.cssString).toEqual("cubic-bezier(0.36, 0, 0.66, -0.56)");
    });
  });
});
