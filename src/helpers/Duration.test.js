import Duration, { registerDurationConvenienceInits } from "./Duration.js";

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

  test("doesn't throw an error when passing in 0", () => {
    expect(() => new Duration({ seconds: 0 })).not.toThrow();
    expect(() => new Duration({ milliseconds: 0 })).not.toThrow();
    expect(new Duration({ seconds: 0 }).ms).toEqual(0);
    expect(new Duration({ milliseconds: 0 }).s).toEqual(0);
  })

  test("throws an error when initialising with an incorrect conversion", () => {
    expect(() => new Duration({ seconds: 3, milliseconds: 2000 })).toThrow();
  });

  test("throws an error when initialising with neither seconds nor milliseconds", () => {
    expect(() => new Duration({ sec: 3 })).toThrow();
  });

  test("can register convenience initialisers on the Number prototype", () => {
    registerDurationConvenienceInits();
    expect((3).seconds().ms).toEqual(3000);
  })
});
