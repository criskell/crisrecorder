import { availableFormats, extensionFor } from "./codecs.js";
import { openCapture } from "./capture.js";
import { createRecorder } from "./recorder.js";
import { createStopwatch } from "./stopwatch.js";
import { formatDuration, formatSize, recordingName } from "./format.js";
import { makeSeekable } from "./seekable.js";

const dom = {
  stage: document.querySelector("[data-stage]"),
  preview: document.querySelector("[data-preview]"),
  hint: document.querySelector("[data-hint]"),
  beacon: document.querySelector("[data-beacon]"),
  elapsed: document.querySelector("[data-elapsed]"),
  size: document.querySelector("[data-size]"),
  microphone: document.querySelector("[data-microphone]"),
  format: document.querySelector("[data-format]"),
  record: document.querySelector("[data-record]"),
  pause: document.querySelector("[data-pause]"),
  stop: document.querySelector("[data-stop]"),
  save: document.querySelector("[data-save]"),
  reset: document.querySelector("[data-reset]"),
  notice: document.querySelector("[data-notice]"),
};

const BUTTONS = ["record", "pause", "stop", "save", "reset"];

const VISIBLE_BUTTONS = {
  idle: ["record"],
  recording: ["pause", "stop"],
  paused: ["pause", "stop"],
  review: ["save", "reset"],
};

const ERROR_MESSAGES = {
  NotAllowedError: "Capture cancelled or blocked by the browser.",
  NotFoundError: "No capture source available.",
  NotReadableError: "That source is already in use by another program.",
};

let capture = null;
let recorder = null;
let downloadUrl = null;
let paused = false;
const stopwatch = createStopwatch(showElapsed);

function showElapsed(milliseconds) {
  dom.elapsed.textContent = formatDuration(milliseconds);
  dom.size.textContent = recorder ? formatSize(recorder.recordedBytes()) : "";
}

function showState(state) {
  BUTTONS.forEach((button) => {
    dom[button].hidden = !VISIBLE_BUTTONS[state].includes(button);
  });

  dom.beacon.toggleAttribute("data-live", state === "recording");
  dom.beacon.toggleAttribute("data-held", state === "paused");
  dom.stage.toggleAttribute("data-empty", state === "idle");
  dom.microphone.disabled = state !== "idle";
  dom.format.disabled = state !== "idle";
  dom.pause.textContent = state === "paused" ? "Resume" : "Pause";
}

function announce(message) {
  dom.notice.textContent = message;
  dom.notice.hidden = !message;
}

function showLiveStream(stream) {
  dom.preview.srcObject = stream;
  dom.preview.muted = true;
  dom.preview.controls = false;
  dom.preview.play();
}

function showRecording(blob) {
  downloadUrl = URL.createObjectURL(blob);
  makeSeekable(dom.preview);
  dom.preview.srcObject = null;
  dom.preview.src = downloadUrl;
  dom.preview.muted = false;
  dom.preview.controls = true;
  dom.save.href = downloadUrl;
  dom.save.download = recordingName(extensionFor(dom.format.value));
  dom.size.textContent = formatSize(blob.size);
}

async function startRecording() {
  announce("");

  try {
    capture = await openCapture({ withMicrophone: dom.microphone.checked });
  } catch (error) {
    announce(ERROR_MESSAGES[error.name] ?? error.message);
    return;
  }

  capture.onSurfaceEnded(finishRecording);
  recorder = createRecorder(capture.stream, dom.format.value);
  recorder.start();
  paused = false;
  stopwatch.start();
  showLiveStream(capture.stream);
  showState("recording");
}

function togglePause() {
  paused = !paused;

  if (paused) {
    recorder.pause();
    stopwatch.hold();
  } else {
    recorder.resume();
    stopwatch.resume();
  }

  showState(paused ? "paused" : "recording");
}

async function finishRecording() {
  if (!recorder) return;

  const blob = await recorder.stop();
  stopwatch.hold();
  capture.close();
  capture = null;
  recorder = null;
  paused = false;
  showRecording(blob);
  showState("review");
}

function startOver() {
  URL.revokeObjectURL(downloadUrl);
  downloadUrl = null;
  dom.preview.removeAttribute("src");
  dom.preview.load();
  dom.size.textContent = "";
  stopwatch.reset();
  showState("idle");
}

function loadFormats() {
  const formats = availableFormats();

  formats.forEach(({ label, mimeType }) => {
    dom.format.add(new Option(label, mimeType));
  });

  return formats.length > 0;
}

function refuseUnsupportedBrowser() {
  dom.record.disabled = true;
  dom.microphone.disabled = true;
  dom.format.disabled = true;
  dom.hint.textContent = "This browser cannot record the screen. Try Chrome, Edge, or Firefox on desktop.";
}

function bootstrap() {
  showState("idle");

  if (!navigator.mediaDevices?.getDisplayMedia || !window.MediaRecorder || !loadFormats()) {
    refuseUnsupportedBrowser();
    return;
  }

  dom.record.addEventListener("click", startRecording);
  dom.pause.addEventListener("click", togglePause);
  dom.stop.addEventListener("click", finishRecording);
  dom.reset.addEventListener("click", startOver);
}

bootstrap();
