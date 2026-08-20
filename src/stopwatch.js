const TICK_MS = 200;

export function createStopwatch(onTick) {
  let accumulated = 0;
  let startedAt = null;
  let ticker = null;

  const elapsed = () => accumulated + (startedAt === null ? 0 : performance.now() - startedAt);

  function run() {
    startedAt = performance.now();
    ticker = setInterval(() => onTick(elapsed()), TICK_MS);
  }

  function hold() {
    accumulated = elapsed();
    startedAt = null;
    clearInterval(ticker);
  }

  return {
    start() {
      accumulated = 0;
      run();
      onTick(0);
    },
    hold,
    resume: run,
    reset() {
      hold();
      accumulated = 0;
      onTick(0);
    },
  };
}
