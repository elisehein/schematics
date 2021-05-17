import CaptionTyping, { CaptionAnimationDirective } from "./CaptionTyping.js";

describe("CaptionTyping", () => {
  let sut;
  beforeEach(() => {
    sut = new CaptionTyping("[TYPE:FAST]Hello, world! [PAUSE:SHORT]Hello,\nagain!");
  });

  test("provides a HTML string with each character wrapped in a hidden <span>", () => {
    const expectedHTML = `<span style="visibility: hidden">H</span><span style="visibility: hidden">e</span><span style="visibility: hidden">l</span><span style="visibility: hidden">l</span><span style="visibility: hidden">o</span><span style="visibility: hidden">,</span><span style="visibility: hidden"> </span><span style="visibility: hidden">w</span><span style="visibility: hidden">o</span><span style="visibility: hidden">r</span><span style="visibility: hidden">l</span><span style="visibility: hidden">d</span><span style="visibility: hidden">!</span><span style="visibility: hidden"> </span><span style="visibility: hidden">H</span><span style="visibility: hidden">e</span><span style="visibility: hidden">l</span><span style="visibility: hidden">l</span><span style="visibility: hidden">o</span><span style="visibility: hidden">,</span><br/><span style="visibility: hidden">a</span><span style="visibility: hidden">g</span><span style="visibility: hidden">a</span><span style="visibility: hidden">i</span><span style="visibility: hidden">n</span><span style="visibility: hidden">!</span>`;
    expect(sut.parsedAndWrappedCaption).toEqual(expectedHTML);
  });

  test("constructs a list of pause and typing directives from the flags", () => {
    const expectedDirectives = [
      new CaptionAnimationDirective("TYPE", "FAST", { fromIndex: 0, toIndex: 13 }),
      new CaptionAnimationDirective("PAUSE", "SHORT", { fromIndex: 14, toIndex: 14 }),
      new CaptionAnimationDirective("TYPE", "FAST", { fromIndex: 14, toIndex: 26 }),
    ];
    expect(sut.animationDirectives).toEqual(expectedDirectives);
  });
});
