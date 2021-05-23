/* eslint-disable max-lines-per-function */
import TimerManager from "./TimerManager.js";

jest.useFakeTimers();

describe("TimerManager", () => {
  let sut;

  beforeEach(() => {
    sut = new TimerManager();
  });

  describe("when setting a timeout", () => {
    test("calls the callback after the given delay", () => {
      const callback = jest.fn();
      sut.setTimeout(callback, 3);
      expect(callback).not.toBeCalled();
      jest.runOnlyPendingTimers();
      expect(callback).toHaveBeenCalledTimes(1);
    });

    test("keeps a reference to the timer", () => {
      expect(sut._timeoutTimers).toHaveLength(0);
      sut.setTimeout(jest.fn(), 0);
      expect(sut._timeoutTimers).toHaveLength(1);

      sut.setTimeout(jest.fn(), 0);
      expect(sut._timeoutTimers).toHaveLength(2);
    });

    test("discards timer reference when the timer has run", () => {
      sut.setTimeout(jest.fn(), 1000);
      sut.setTimeout(jest.fn(), 3000);
      expect(sut._timeoutTimers).toHaveLength(2);
      jest.advanceTimersByTime(1001);
      expect(sut._timeoutTimers).toHaveLength(1);
    });
  });

  describe("when setting an interval", () => {
    test("calls the callback at the given interval", () => {
      const callback = jest.fn();
      sut.setInterval(callback, 3);
      expect(callback).not.toBeCalled();
      jest.advanceTimersByTime(4);
      expect(callback).toHaveBeenCalledTimes(1);
      jest.advanceTimersByTime(4);
      expect(callback).toHaveBeenCalledTimes(2);
    });

    test("keeps a reference to the timer", () => {
      expect(sut._intervalTimers).toHaveLength(0);
      sut.setInterval(jest.fn(), 1);
      expect(sut._intervalTimers).toHaveLength(1);

      sut.setInterval(jest.fn(), 1);
      expect(sut._intervalTimers).toHaveLength(2);
    });

    test("doesn't discard the timer reference when an interval has run", () => {
      const fn = jest.fn();
      sut.setInterval(fn, 3);
      expect(sut._intervalTimers).toHaveLength(1);
      jest.runOnlyPendingTimers();
      expect(sut._intervalTimers).toHaveLength(1);
    });
  });

  describe("when clearing a timeout", () => {
    let callback, timer;

    beforeEach(() => {
      callback = jest.fn();
      timer = sut.setTimeout(callback, 10);
    });

    test("the callback isn't called", () => {
      sut.clearTimeout(timer);
      jest.advanceTimersByTime(11);
      expect(callback).not.toBeCalled();
    });

    test("a reference to the timer is discarded", () => {
      expect(sut._timeoutTimers).toContain(timer);
      sut.clearTimeout(timer);
      jest.advanceTimersByTime(11);
      expect(sut._timeoutTimers).not.toContain(timer);
    });
  });

  describe("when clearing an interval", () => {
    let callback, timer;

    beforeEach(() => {
      callback = jest.fn();
      timer = sut.setInterval(callback, 10);
    });

    test("the interval isn't called", () => {
      sut.clearInterval(timer);
      jest.advanceTimersByTime(11);
      expect(callback).not.toBeCalled();
    });

    test("a reference to the timer is discarded", () => {
      expect(sut._intervalTimers).toContain(timer);
      sut.clearInterval(timer);
      jest.advanceTimersByTime(11);
      expect(sut._intervalTimers).not.toContain(timer);
    });
  });

  describe("when clearing all timeouts", () => {
    let callback1, callback2, callback3;

    beforeEach(() => {
      callback1 = jest.fn();
      callback2 = jest.fn();
      callback3 = jest.fn();
      sut.setTimeout(callback1, 10);
      sut.setTimeout(callback2, 20);
      sut.setTimeout(callback3, 30);
    });

    test("none of the callbacks are called", () => {
      sut.clearAllTimeouts();
      jest.advanceTimersByTime(31);
      expect(callback1).not.toBeCalled();
      expect(callback2).not.toBeCalled();
      expect(callback3).not.toBeCalled();
    });

    test("all timer references are cleared", () => {
      expect(sut._timeoutTimers).toHaveLength(3);
      sut.clearAllTimeouts();
      jest.advanceTimersByTime(31);
      expect(sut._timeoutTimers).toHaveLength(0);
    });
  });

  describe("when clearing all intervals", () => {
    let callback1, callback2, callback3;

    beforeEach(() => {
      callback1 = jest.fn();
      callback2 = jest.fn();
      callback3 = jest.fn();
      sut.setInterval(callback1, 10);
      sut.setInterval(callback2, 20);
      sut.setInterval(callback3, 30);
    });

    test("none of the callbacks are called", () => {
      sut.clearAllIntervals();
      jest.advanceTimersByTime(31);
      expect(callback1).not.toBeCalled();
      expect(callback2).not.toBeCalled();
      expect(callback3).not.toBeCalled();
    });

    test("all timer references are cleared", () => {
      expect(sut._intervalTimers).toHaveLength(3);
      sut.clearAllIntervals();
      jest.advanceTimersByTime(31);
      expect(sut._intervalTimers).toHaveLength(0);
    });
  });
});
