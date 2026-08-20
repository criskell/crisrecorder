const CHUNK_MS = 1000;
const VIDEO_BITRATE = 8_000_000;

export function createRecorder(stream, mimeType) {
  const chunks = [];
  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: VIDEO_BITRATE });

  recorder.addEventListener("dataavailable", (event) => {
    if (event.data.size > 0) chunks.push(event.data);
  });

  const finished = new Promise((resolve) => {
    recorder.addEventListener("stop", () => resolve(new Blob(chunks, { type: mimeType })), { once: true });
  });

  return {
    start: () => recorder.start(CHUNK_MS),
    pause: () => recorder.pause(),
    resume: () => recorder.resume(),
    stop() {
      if (recorder.state !== "inactive") recorder.stop();
      return finished;
    },
    recordedBytes: () => chunks.reduce((total, chunk) => total + chunk.size, 0),
  };
}
