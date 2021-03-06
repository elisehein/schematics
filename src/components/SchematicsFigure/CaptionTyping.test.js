/* eslint-disable max-lines-per-function */
import CaptionTyping from "./CaptionTyping.js";

describe("CaptionTyping", () => {
  const captionWithOnePause = "[TYPE:FAST]Hello, world!\n[PAUSE:SHORT]Hello,\nagain!";

  test("provides a HTML string with each character wrapped in a hidden <span>", () => {
    const sut = new CaptionTyping(captionWithOnePause);
    // eslint-disable-next-line quotes
    const expectedHTML = `<span class="schematics-figure__figure__figcaption__character">H</span><span class="schematics-figure__figure__figcaption__character">e</span><span class="schematics-figure__figure__figcaption__character">l</span><span class="schematics-figure__figure__figcaption__character">l</span><span class="schematics-figure__figure__figcaption__character">o</span><span class="schematics-figure__figure__figcaption__character">,</span><span class="schematics-figure__figure__figcaption__character"> </span><span class="schematics-figure__figure__figcaption__character">w</span><span class="schematics-figure__figure__figcaption__character">o</span><span class="schematics-figure__figure__figcaption__character">r</span><span class="schematics-figure__figure__figcaption__character">l</span><span class="schematics-figure__figure__figcaption__character">d</span><span class="schematics-figure__figure__figcaption__character">!</span><span class="schematics-figure__figure__figcaption__character schematics-figure__figure__figcaption__character--line-break"></span><br/><span class="schematics-figure__figure__figcaption__character">H</span><span class="schematics-figure__figure__figcaption__character">e</span><span class="schematics-figure__figure__figcaption__character">l</span><span class="schematics-figure__figure__figcaption__character">l</span><span class="schematics-figure__figure__figcaption__character">o</span><span class="schematics-figure__figure__figcaption__character">,</span><span class="schematics-figure__figure__figcaption__character schematics-figure__figure__figcaption__character--line-break"></span><br/><span class="schematics-figure__figure__figcaption__character">a</span><span class="schematics-figure__figure__figcaption__character">g</span><span class="schematics-figure__figure__figcaption__character">a</span><span class="schematics-figure__figure__figcaption__character">i</span><span class="schematics-figure__figure__figcaption__character">n</span><span class="schematics-figure__figure__figcaption__character">!</span>`;
    expect(sut.parsedAndWrappedCaption).toEqual(expectedHTML);
  });

  describe("when constructing a list of typing delay changes from the flags", () => {
    test("resets the typing delay to the previous value after a pause", () => {
      const sut = new CaptionTyping(captionWithOnePause);
      const expectedDelayChanges = [
        { index: 0, delay: 45 },
        { index: 14, delay: 300, isPause: true, pauseIndex: 0 },
        { index: 15, delay: 45 }
      ];
      expect(sut.singleCharacterDelayRanges).toEqual(expectedDelayChanges);
    });

    test("uses a default delay of 0 after pause if no pacing information is given", () => {
      const sut = new CaptionTyping("No flags [PAUSE:MEDIUM]yet.");
      const expectedDelayChanges = [
        { index: 0, delay: 0 },
        { index: 9, delay: 800, isPause: true, pauseIndex: 0 },
        { index: 10, delay: 0 }
      ];
      expect(sut.singleCharacterDelayRanges).toEqual(expectedDelayChanges);
    });

    test("overrides any delays that are specified on the same index", () => {
      const sut = new CaptionTyping("[TYPE:FAST][TYPE:FASTEST]No typing speed flags.");
      const expectedDelayChanges = [
        { index: 0, delay: 20 }
      ];
      expect(sut.singleCharacterDelayRanges).toEqual(expectedDelayChanges);
    });

    test("takes into account typing speed changes even if that index is overridden", () => {
      const sut = new CaptionTyping("No typing [TYPE:SLOW][PAUSE:LONG]speed flags.");
      const expectedDelayChanges = [
        { index: 0, delay: 0 },
        { index: 10, delay: 1300, isPause: true, pauseIndex: 0 },
        { index: 11, delay: 130 }
      ];
      expect(sut.singleCharacterDelayRanges).toEqual(expectedDelayChanges);
    });

    test("overrides the default delay if the animation begins with a pause", () => {
      const sut = new CaptionTyping("[PAUSE:SHORT]No typing speed flags.");
      const expectedDelayChanges = [
        { index: 0, delay: 300, isPause: true, pauseIndex: 0 },
        { index: 1, delay: 0 }
      ];
      expect(sut.singleCharacterDelayRanges).toEqual(expectedDelayChanges);
    });

    test("adds a default zero delay if no flags are set", () => {
      const sut = new CaptionTyping("No flags at all.");
      expect(sut.singleCharacterDelayRanges).toEqual([{ index: 0, delay: 0 }]);
    });

    test("uses a literal value for a pause duration if provided in the flag", () => {
      const sut = new CaptionTyping("Extra long pause[PAUSE:5000] from literal value");
      const expectedDelayChanges = [
        { index: 0, delay: 0 },
        { index: 16, delay: 5000, isPause: true, pauseIndex: 0 },
        { index: 17, delay: 0 }
      ];
      expect(sut.singleCharacterDelayRanges).toEqual(expectedDelayChanges);
    });

    test("adds correct pause indeces if there are multiple pauses", () => {
      const sut = new CaptionTyping("[TYPE:FAST]String [PAUSE:SHORT]with multiple [PAUSE:SHORT]pauses[PAUSE:MEDIUM].");
      const expectedDelayChanges = [
        { index: 0, delay: 45 },
        { index: 7, delay: 300, isPause: true, pauseIndex: 0 },
        { index: 8, delay: 45 },
        { index: 21, delay: 300, isPause: true, pauseIndex: 1 },
        { index: 22, delay: 45 },
        { index: 27, delay: 800, isPause: true, pauseIndex: 2 },
        { index: 28, delay: 45 }
      ];
      expect(sut.singleCharacterDelayRanges).toEqual(expectedDelayChanges);
    });
  });

  describe("when given a caption with newlines", () => {
    test("replaces the newlines with <br/> and wraps them in spans, too", () => {
      const sut = new CaptionTyping(`X
Y`);
      // eslint-disable-next-line quotes
      expect(sut.parsedAndWrappedCaption).toEqual(`<span class="schematics-figure__figure__figcaption__character">X</span><span class="schematics-figure__figure__figcaption__character schematics-figure__figure__figcaption__character--line-break"></span><br/><span class="schematics-figure__figure__figcaption__character">Y</span>`);
    });
  });

  test("correctly parses a real-world case (fig. 14)", () => {
    const poetry = `[TYPE:NORMAL]I return [PAUSE:SHORT]and sense,
[PAUSE:LONG]things are not the same as before,
[TYPE:FAST][PAUSE:LONG]but feel had I stayed,
[PAUSE:MEDIUM]everything would likely seem the same.`;
    const sut = new CaptionTyping(poetry);
    // eslint-disable-next-line quotes
    const expectedHTML = `<span class="schematics-figure__figure__figcaption__character">I</span><span class="schematics-figure__figure__figcaption__character"> </span><span class="schematics-figure__figure__figcaption__character">r</span><span class="schematics-figure__figure__figcaption__character">e</span><span class="schematics-figure__figure__figcaption__character">t</span><span class="schematics-figure__figure__figcaption__character">u</span><span class="schematics-figure__figure__figcaption__character">r</span><span class="schematics-figure__figure__figcaption__character">n</span><span class="schematics-figure__figure__figcaption__character"> </span><span class="schematics-figure__figure__figcaption__character">a</span><span class="schematics-figure__figure__figcaption__character">n</span><span class="schematics-figure__figure__figcaption__character">d</span><span class="schematics-figure__figure__figcaption__character"> </span><span class="schematics-figure__figure__figcaption__character">s</span><span class="schematics-figure__figure__figcaption__character">e</span><span class="schematics-figure__figure__figcaption__character">n</span><span class="schematics-figure__figure__figcaption__character">s</span><span class="schematics-figure__figure__figcaption__character">e</span><span class="schematics-figure__figure__figcaption__character">,</span><span class="schematics-figure__figure__figcaption__character schematics-figure__figure__figcaption__character--line-break"></span><br/><span class="schematics-figure__figure__figcaption__character">t</span><span class="schematics-figure__figure__figcaption__character">h</span><span class="schematics-figure__figure__figcaption__character">i</span><span class="schematics-figure__figure__figcaption__character">n</span><span class="schematics-figure__figure__figcaption__character">g</span><span class="schematics-figure__figure__figcaption__character">s</span><span class="schematics-figure__figure__figcaption__character"> </span><span class="schematics-figure__figure__figcaption__character">a</span><span class="schematics-figure__figure__figcaption__character">r</span><span class="schematics-figure__figure__figcaption__character">e</span><span class="schematics-figure__figure__figcaption__character"> </span><span class="schematics-figure__figure__figcaption__character">n</span><span class="schematics-figure__figure__figcaption__character">o</span><span class="schematics-figure__figure__figcaption__character">t</span><span class="schematics-figure__figure__figcaption__character"> </span><span class="schematics-figure__figure__figcaption__character">t</span><span class="schematics-figure__figure__figcaption__character">h</span><span class="schematics-figure__figure__figcaption__character">e</span><span class="schematics-figure__figure__figcaption__character"> </span><span class="schematics-figure__figure__figcaption__character">s</span><span class="schematics-figure__figure__figcaption__character">a</span><span class="schematics-figure__figure__figcaption__character">m</span><span class="schematics-figure__figure__figcaption__character">e</span><span class="schematics-figure__figure__figcaption__character"> </span><span class="schematics-figure__figure__figcaption__character">a</span><span class="schematics-figure__figure__figcaption__character">s</span><span class="schematics-figure__figure__figcaption__character"> </span><span class="schematics-figure__figure__figcaption__character">b</span><span class="schematics-figure__figure__figcaption__character">e</span><span class="schematics-figure__figure__figcaption__character">f</span><span class="schematics-figure__figure__figcaption__character">o</span><span class="schematics-figure__figure__figcaption__character">r</span><span class="schematics-figure__figure__figcaption__character">e</span><span class="schematics-figure__figure__figcaption__character">,</span><span class="schematics-figure__figure__figcaption__character schematics-figure__figure__figcaption__character--line-break"></span><br/><span class="schematics-figure__figure__figcaption__character">b</span><span class="schematics-figure__figure__figcaption__character">u</span><span class="schematics-figure__figure__figcaption__character">t</span><span class="schematics-figure__figure__figcaption__character"> </span><span class="schematics-figure__figure__figcaption__character">f</span><span class="schematics-figure__figure__figcaption__character">e</span><span class="schematics-figure__figure__figcaption__character">e</span><span class="schematics-figure__figure__figcaption__character">l</span><span class="schematics-figure__figure__figcaption__character"> </span><span class="schematics-figure__figure__figcaption__character">h</span><span class="schematics-figure__figure__figcaption__character">a</span><span class="schematics-figure__figure__figcaption__character">d</span><span class="schematics-figure__figure__figcaption__character"> </span><span class="schematics-figure__figure__figcaption__character">I</span><span class="schematics-figure__figure__figcaption__character"> </span><span class="schematics-figure__figure__figcaption__character">s</span><span class="schematics-figure__figure__figcaption__character">t</span><span class="schematics-figure__figure__figcaption__character">a</span><span class="schematics-figure__figure__figcaption__character">y</span><span class="schematics-figure__figure__figcaption__character">e</span><span class="schematics-figure__figure__figcaption__character">d</span><span class="schematics-figure__figure__figcaption__character">,</span><span class="schematics-figure__figure__figcaption__character schematics-figure__figure__figcaption__character--line-break"></span><br/><span class="schematics-figure__figure__figcaption__character">e</span><span class="schematics-figure__figure__figcaption__character">v</span><span class="schematics-figure__figure__figcaption__character">e</span><span class="schematics-figure__figure__figcaption__character">r</span><span class="schematics-figure__figure__figcaption__character">y</span><span class="schematics-figure__figure__figcaption__character">t</span><span class="schematics-figure__figure__figcaption__character">h</span><span class="schematics-figure__figure__figcaption__character">i</span><span class="schematics-figure__figure__figcaption__character">n</span><span class="schematics-figure__figure__figcaption__character">g</span><span class="schematics-figure__figure__figcaption__character"> </span><span class="schematics-figure__figure__figcaption__character">w</span><span class="schematics-figure__figure__figcaption__character">o</span><span class="schematics-figure__figure__figcaption__character">u</span><span class="schematics-figure__figure__figcaption__character">l</span><span class="schematics-figure__figure__figcaption__character">d</span><span class="schematics-figure__figure__figcaption__character"> </span><span class="schematics-figure__figure__figcaption__character">l</span><span class="schematics-figure__figure__figcaption__character">i</span><span class="schematics-figure__figure__figcaption__character">k</span><span class="schematics-figure__figure__figcaption__character">e</span><span class="schematics-figure__figure__figcaption__character">l</span><span class="schematics-figure__figure__figcaption__character">y</span><span class="schematics-figure__figure__figcaption__character"> </span><span class="schematics-figure__figure__figcaption__character">s</span><span class="schematics-figure__figure__figcaption__character">e</span><span class="schematics-figure__figure__figcaption__character">e</span><span class="schematics-figure__figure__figcaption__character">m</span><span class="schematics-figure__figure__figcaption__character"> </span><span class="schematics-figure__figure__figcaption__character">t</span><span class="schematics-figure__figure__figcaption__character">h</span><span class="schematics-figure__figure__figcaption__character">e</span><span class="schematics-figure__figure__figcaption__character"> </span><span class="schematics-figure__figure__figcaption__character">s</span><span class="schematics-figure__figure__figcaption__character">a</span><span class="schematics-figure__figure__figcaption__character">m</span><span class="schematics-figure__figure__figcaption__character">e</span><span class="schematics-figure__figure__figcaption__character">.</span>`;

    expect(sut.parsedAndWrappedCaption).toEqual(expectedHTML);
    expect(sut.singleCharacterDelayRanges).toEqual([
      { index: 0, delay: 70 },
      { index: 9, delay: 300, isPause: true, pauseIndex: 0 },
      { index: 10, delay: 70 },
      { index: 20, delay: 1300, isPause: true, pauseIndex: 1 },
      { index: 21, delay: 70 },
      { index: 55, delay: 1300, isPause: true, pauseIndex: 2 },
      { index: 56, delay: 45 },
      { index: 78, delay: 800, isPause: true, pauseIndex: 3 },
      { index: 79, delay: 45 }
    ]);
  });
});
