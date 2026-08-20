const BEYOND_ANY_RECORDING = 1e101;

export function makeSeekable(video) {
  video.addEventListener(
    "loadedmetadata",
    () => {
      if (Number.isFinite(video.duration)) return;

      video.currentTime = BEYOND_ANY_RECORDING;
      video.addEventListener("timeupdate", () => { video.currentTime = 0; }, { once: true });
    },
    { once: true },
  );
}
