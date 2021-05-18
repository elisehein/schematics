import CaptionTyping, { CaptionAnimationDirective } from "./CaptionTyping.js";

describe("CaptionTyping", () => {
  const captionWithOnePause = "[TYPE:FAST]Hello, world!\n[PAUSE:SHORT]Hello,\nagain!";

  test("provides a HTML string with each character wrapped in a hidden <span>", () => {
    const sut = new CaptionTyping(captionWithOnePause);
    const expectedHTML = `<span style="visibility: hidden;">H</span><span style="visibility: hidden;">e</span><span style="visibility: hidden;">l</span><span style="visibility: hidden;">l</span><span style="visibility: hidden;">o</span><span style="visibility: hidden;">,</span><span style="visibility: hidden;"> </span><span style="visibility: hidden;">w</span><span style="visibility: hidden;">o</span><span style="visibility: hidden;">r</span><span style="visibility: hidden;">l</span><span style="visibility: hidden;">d</span><span style="visibility: hidden;">!</span><span style="visibility: hidden;"><br/></span><span style="visibility: hidden;">H</span><span style="visibility: hidden;">e</span><span style="visibility: hidden;">l</span><span style="visibility: hidden;">l</span><span style="visibility: hidden;">o</span><span style="visibility: hidden;">,</span><span style="visibility: hidden;"><br/></span><span style="visibility: hidden;">a</span><span style="visibility: hidden;">g</span><span style="visibility: hidden;">a</span><span style="visibility: hidden;">i</span><span style="visibility: hidden;">n</span><span style="visibility: hidden;">!</span>`;
    expect(sut.parsedAndWrappedCaption).toEqual(expectedHTML);
  });

  describe("when constructing a list of typing delay changes from the flags", () => {
    test("resets the typing delay to the previous value after a pause", () => {
      const sut = new CaptionTyping(captionWithOnePause);
      const expectedDelayChanges = [
        { index: 0, delay: 45 },
        { index: 14, delay: 300 },
        { index: 15, delay: 45 }
      ];
      expect(sut.singleCharacterDelayRanges).toEqual(expectedDelayChanges);
    });

    test("uses a default delay of 0 after pause if no pacing information is given", () => {
      let sut = new CaptionTyping("No flags [PAUSE:MEDIUM]yet.")
      let expectedDelayChanges = [
        { index: 0, delay: 0 },
        { index: 9, delay: 800 },
        { index: 10, delay: 0 }
      ];
      expect(sut.singleCharacterDelayRanges).toEqual(expectedDelayChanges);
    });

    test("overrides any delays that are specified on the same index", () => {
      let sut = new CaptionTyping("[TYPE:FAST][TYPE:FASTEST]No typing speed flags.")
      let expectedDelayChanges = [
        { index: 0, delay: 20 },
      ];
      expect(sut.singleCharacterDelayRanges).toEqual(expectedDelayChanges);
    });

    test("takes into account typing speed changes even if that index is overridden", () => {
      const sut = new CaptionTyping("No typing [TYPE:SLOW][PAUSE:LONG]speed flags.")
      const expectedDelayChanges = [
        { index: 0, delay: 0 },
        { index: 10, delay: 1300 },
        { index: 11, delay: 110 }
      ];
      expect(sut.singleCharacterDelayRanges).toEqual(expectedDelayChanges);
    });

    test("overrides the default delay if the animation begins with a pause", () => {
      const sut = new CaptionTyping("[PAUSE:SHORT]No typing speed flags.")
      const expectedDelayChanges = [
        { index: 0, delay: 300 },
        { index: 1, delay: 0 }
      ];
      expect(sut.singleCharacterDelayRanges).toEqual(expectedDelayChanges);
    });

    test("adds a default zero delay if no flags are set", () => {
      const sut = new CaptionTyping("No flags at all.")
      expect(sut.singleCharacterDelayRanges).toEqual([{ index: 0, delay: 0 }]);
    });
  });

  describe("when given a caption with newlines", () => {
    test("replaces the newlines with <br/> and wraps them in spans, too", () => {
      const sut = new CaptionTyping(`X
Y`);
      expect(sut.parsedAndWrappedCaption).toEqual(`<span style="visibility: hidden;">X</span><span style="visibility: hidden;"><br/></span><span style="visibility: hidden;">Y</span>`);
    });
  });

  test("correctly parses a real-world case (fig. 14)", () => {
    const poetry = `[TYPE:NORMAL]I return [PAUSE:SHORT]and sense,
[PAUSE:LONG]things are not the same as before,
[TYPE:FAST][PAUSE:LONG]but feel had I stayed,
[PAUSE:MEDIUM]everything would likely seem the same.`;
    const sut = new CaptionTyping(poetry);
    const expectedHTML = `<span style="visibility: hidden;">I</span><span style="visibility: hidden;"> </span><span style="visibility: hidden;">r</span><span style="visibility: hidden;">e</span><span style="visibility: hidden;">t</span><span style="visibility: hidden;">u</span><span style="visibility: hidden;">r</span><span style="visibility: hidden;">n</span><span style="visibility: hidden;"> </span><span style="visibility: hidden;">a</span><span style="visibility: hidden;">n</span><span style="visibility: hidden;">d</span><span style="visibility: hidden;"> </span><span style="visibility: hidden;">s</span><span style="visibility: hidden;">e</span><span style="visibility: hidden;">n</span><span style="visibility: hidden;">s</span><span style="visibility: hidden;">e</span><span style="visibility: hidden;">,</span><span style="visibility: hidden;"><br/></span><span style="visibility: hidden;">t</span><span style="visibility: hidden;">h</span><span style="visibility: hidden;">i</span><span style="visibility: hidden;">n</span><span style="visibility: hidden;">g</span><span style="visibility: hidden;">s</span><span style="visibility: hidden;"> </span><span style="visibility: hidden;">a</span><span style="visibility: hidden;">r</span><span style="visibility: hidden;">e</span><span style="visibility: hidden;"> </span><span style="visibility: hidden;">n</span><span style="visibility: hidden;">o</span><span style="visibility: hidden;">t</span><span style="visibility: hidden;"> </span><span style="visibility: hidden;">t</span><span style="visibility: hidden;">h</span><span style="visibility: hidden;">e</span><span style="visibility: hidden;"> </span><span style="visibility: hidden;">s</span><span style="visibility: hidden;">a</span><span style="visibility: hidden;">m</span><span style="visibility: hidden;">e</span><span style="visibility: hidden;"> </span><span style="visibility: hidden;">a</span><span style="visibility: hidden;">s</span><span style="visibility: hidden;"> </span><span style="visibility: hidden;">b</span><span style="visibility: hidden;">e</span><span style="visibility: hidden;">f</span><span style="visibility: hidden;">o</span><span style="visibility: hidden;">r</span><span style="visibility: hidden;">e</span><span style="visibility: hidden;">,</span><span style="visibility: hidden;"><br/></span><span style="visibility: hidden;">b</span><span style="visibility: hidden;">u</span><span style="visibility: hidden;">t</span><span style="visibility: hidden;"> </span><span style="visibility: hidden;">f</span><span style="visibility: hidden;">e</span><span style="visibility: hidden;">e</span><span style="visibility: hidden;">l</span><span style="visibility: hidden;"> </span><span style="visibility: hidden;">h</span><span style="visibility: hidden;">a</span><span style="visibility: hidden;">d</span><span style="visibility: hidden;"> </span><span style="visibility: hidden;">I</span><span style="visibility: hidden;"> </span><span style="visibility: hidden;">s</span><span style="visibility: hidden;">t</span><span style="visibility: hidden;">a</span><span style="visibility: hidden;">y</span><span style="visibility: hidden;">e</span><span style="visibility: hidden;">d</span><span style="visibility: hidden;">,</span><span style="visibility: hidden;"><br/></span><span style="visibility: hidden;">e</span><span style="visibility: hidden;">v</span><span style="visibility: hidden;">e</span><span style="visibility: hidden;">r</span><span style="visibility: hidden;">y</span><span style="visibility: hidden;">t</span><span style="visibility: hidden;">h</span><span style="visibility: hidden;">i</span><span style="visibility: hidden;">n</span><span style="visibility: hidden;">g</span><span style="visibility: hidden;"> </span><span style="visibility: hidden;">w</span><span style="visibility: hidden;">o</span><span style="visibility: hidden;">u</span><span style="visibility: hidden;">l</span><span style="visibility: hidden;">d</span><span style="visibility: hidden;"> </span><span style="visibility: hidden;">l</span><span style="visibility: hidden;">i</span><span style="visibility: hidden;">k</span><span style="visibility: hidden;">e</span><span style="visibility: hidden;">l</span><span style="visibility: hidden;">y</span><span style="visibility: hidden;"> </span><span style="visibility: hidden;">s</span><span style="visibility: hidden;">e</span><span style="visibility: hidden;">e</span><span style="visibility: hidden;">m</span><span style="visibility: hidden;"> </span><span style="visibility: hidden;">t</span><span style="visibility: hidden;">h</span><span style="visibility: hidden;">e</span><span style="visibility: hidden;"> </span><span style="visibility: hidden;">s</span><span style="visibility: hidden;">a</span><span style="visibility: hidden;">m</span><span style="visibility: hidden;">e</span><span style="visibility: hidden;">.</span>`;

    expect(sut.parsedAndWrappedCaption).toEqual(expectedHTML);
    expect(sut.singleCharacterDelayRanges).toEqual([
      { index: 0, delay: 70 },
      { index: 9, delay: 300 },
      { index: 10, delay: 70 },
      { index: 20, delay: 1300 },
      { index: 21, delay: 70 },
      { index: 55, delay: 1300 },
      { index: 56, delay: 45 },
      { index: 78, delay: 800 },
      { index: 79, delay: 45 }
    ]);
  });
});
