export default class TimerManager {
  constructor() {
    this._timeoutTimers = [];
    this._intervalTimers = [];
  }

  setTimeout(callback, delay) {
    const timer = window.setTimeout(() => {
      callback();
      this.removeTimer(timer, this._timeoutTimers);
    }, delay);

    this.addTimer(timer, this._timeoutTimers);
    return timer;
  }

  setInterval(callback, interval) {
    const timer = window.setInterval(callback, interval);
    this.addTimer(timer, this._intervalTimers);
    return timer;
  }

  clearTimeout(timer) {
    window.clearTimeout(timer);
    this.removeTimer(timer, this._timeoutTimers);
  }

  clearInterval(timer) {
    window.clearInterval(timer);
    this.removeTimer(timer, this._intervalTimers);
  }

  removeTimer(timer, timers) {
    const index = timers.indexOf(timer);
    timers.splice(index, 1);
  }

  addTimer(timer, timers) {
    timers.push(timer);
  }

  clearAllTimeouts() {
    this._timeoutTimers.forEach(window.clearTimeout);
    this._timeoutTimers = [];
  }

  clearAllIntervals() {
    this._intervalTimers.forEach(window.clearInterval);
    this._intervalTimers = [];
  }
}
