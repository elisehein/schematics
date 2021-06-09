import HashNavigation from "./HashNavigation.js";

const oldWindowLocation = window.location;

describe("HashNavigation", () => {
  let onNavigateToRoot;
  let onNavigateToFigure;
  let hashChangeTrigger;
  let sut;

  beforeAll(() => {
    delete window.location;
  });

  afterAll(() => {
    window.location = oldWindowLocation;
  });

  describe("when initialised", () => {
    beforeEach(() => {
      jest.spyOn(window, "addEventListener").mockImplementation((eventName, callback) => {
        hashChangeTrigger = callback;
      });
      jest.spyOn(window.history, "pushState");
      onNavigateToRoot = jest.fn();
      onNavigateToFigure = jest.fn();
      sut = new HashNavigation({ onNavigateToRoot, onNavigateToFigure });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe("if the current hash is #fig14", () => {
      const oldURLForHashChange = "http://localhost:3000#fig14";

      beforeEach(() => {
        mockHash("#fig14");
        sut.init();
      });

      test("calls onNavigateToFigure with the correct num", () => {
        expect(onNavigateToFigure).toBeCalledTimes(1);
        expect(onNavigateToFigure).toHaveBeenCalledWith(14);
      });

      test("doesn't call onNavigateToRoot", () => {
        expect(onNavigateToRoot).not.toBeCalled();
      });

      describe("when the hash changes to #fig43", () => {
        beforeEach(() => {
          mockHash("#fig43");
          hashChangeTrigger({ oldURL: oldURLForHashChange });
        });

        test("calls onNavigateToFigure with both the new and old figure number", () => {
          expect(onNavigateToFigure).toHaveBeenCalledWith(43, 14);
          expect(onNavigateToRoot).not.toHaveBeenCalled();
          expect(window.history.pushState).not.toHaveBeenCalled();
        });
      });

      describe("when the hash changes to #", () => {
        beforeEach(() => {
          mockHash("#")
          hashChangeTrigger({ oldURL: oldURLForHashChange });
        });

        test("clears the hash and calls onNavigateToRoot", () => {
          expect(window.history.pushState).toHaveBeenCalledWith(null, null, "#");
          expect(onNavigateToRoot).toHaveBeenCalledTimes(1);
          expect(onNavigateToFigure).toHaveBeenCalledTimes(1); // Leftover from init
        });
      });

      describe("when the hash changes to nonsense", () => {
        beforeEach(() => {
          mockHash("#something-stupid");
          hashChangeTrigger({ oldURL: oldURLForHashChange });
        });

        test("clears the hash and calls onNavigateToRoot", () => {
          expect(window.history.pushState).toHaveBeenCalledWith(null, null, "#");
          expect(onNavigateToRoot).toHaveBeenCalledTimes(1);
          expect(onNavigateToFigure).toHaveBeenCalledTimes(1); // Leftover from init
        });
      });
    });

    describe("if there is no current hash", () => {
      beforeEach(() => {
        mockHash("");
        sut.init();
      });

      test("calls onNavigateToRoot", () => {
        expect(onNavigateToRoot).toHaveBeenCalledTimes(1);
      });

      test("doesn't call onNavigateToFigure", () => {
        expect(onNavigateToFigure).not.toBeCalled();
      });

      test("doesn't change the hash", () => {
        expect(window.history.pushState).not.toBeCalled();
      });

      describe("when the hash changes to #fig2", () => {
        beforeEach(() => {
          mockHash("#fig2");
          hashChangeTrigger({ oldURL: "http://no.hash" });
        });

        test("calls onNavigateToFigure", () => {
          expect(onNavigateToFigure).toHaveBeenCalledWith(2, null);
          expect(window.history.pushState).not.toHaveBeenCalled();
          expect(onNavigateToRoot).toHaveBeenCalledTimes(1); // Leftover from init
        });
      });

      describe("when the hash changes to nonsense", () => {
        beforeEach(() => {
          mockHash("#nonsense");
          hashChangeTrigger({ oldURL: "http://no.hash " });
        });

        test("clears the hash", () => {
          expect(window.history.pushState).toHaveBeenCalledWith(null, null, "#");
          expect(onNavigateToRoot).toHaveBeenCalledTimes(1); // Leftover from init
          expect(onNavigateToFigure).not.toBeCalled();
        });
      });
    });

    describe("if the current hash is irrelevant", () => {
      beforeEach(() => {
        mockHash("#something-random");
        sut.init();
      });

      test("clears the current hash and calls onNavigateToRoot", () => {
        expect(window.history.pushState).toHaveBeenCalledWith(null, null, "#");
        expect(onNavigateToRoot).toHaveBeenCalledTimes(1);
        expect(onNavigateToFigure).not.toBeCalled();
      });

      describe("when the hash changes to #fig35", () => {
        beforeEach(() => {
          mockHash("#fig35");
          hashChangeTrigger({ oldURL: "http://no.hash" });
        });

        test("calls onNavigateToFigure with 35", () => {
          expect(onNavigateToFigure).toHaveBeenCalledWith(35, null);
          expect(window.history.pushState).toHaveBeenCalledTimes(1); // Leftover from init
          expect(onNavigateToRoot).toHaveBeenCalledTimes(1); // Leftover from init
        });
      });
    });
  });
});

function mockHash(mockedValue) {
  window.location = Object.defineProperties({}, {
    ...Object.getOwnPropertyDescriptors(oldWindowLocation),
    hash: {
      configurable: true,
      value: mockedValue
    }
  })
}