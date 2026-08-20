import { mixAudio } from "./audioMixer.js";

const DISPLAY_OPTIONS = {
  video: { frameRate: { ideal: 60 } },
  audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
};

const MICROPHONE_OPTIONS = {
  audio: { echoCancellation: true, noiseSuppression: true },
};

function stopTracks(stream) {
  stream.getTracks().forEach((track) => track.stop());
}

export async function openCapture({ withMicrophone }) {
  const display = await navigator.mediaDevices.getDisplayMedia(DISPLAY_OPTIONS);
  const microphone = withMicrophone ? await openMicrophone(display) : null;
  const audio = mixAudio([display, microphone].filter(Boolean));
  const stream = new MediaStream([...display.getVideoTracks(), ...audio.tracks]);

  return {
    stream,
    onSurfaceEnded(listener) {
      display.getVideoTracks()[0].addEventListener("ended", listener, { once: true });
    },
    close() {
      audio.dispose();
      stopTracks(display);
      if (microphone) stopTracks(microphone);
    },
  };
}

async function openMicrophone(display) {
  try {
    return await navigator.mediaDevices.getUserMedia(MICROPHONE_OPTIONS);
  } catch (error) {
    stopTracks(display);
    throw error;
  }
}
