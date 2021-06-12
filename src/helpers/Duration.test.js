import Duration from "./Duration.js";

describe("Duration", () => {
  test("converts to seconds correctly", () => {
    expect((new Duration({ milliseconds: 1000 })).s).toEqual(1);
  });

  test("converts to milliseconds correctly", () => {
    expect((new Duration({ seconds: 3 })).ms).toEqual(3000);
  });

  test("allows initialisation with correct ms and s", () => {
    expect((new Duration({ seconds: 3, milliseconds: 3000 })).s).toEqual(3);
  });

  test("throws an error when initialising with an incorrect conversion", () => {
    expect(() => new Duration({ seconds: 3, milliseconds: 2000 })).toThrow();
  });

  test("throws an error when initialising with neither seconds nor milliseconds", () => {
    expect(() => new Duration({ sec: 3 })).toThrow();
  });
});
