const CANDIDATES = [
  { label: "WebM · VP9", mimeType: "video/webm;codecs=vp9,opus" },
  { label: "WebM · VP8", mimeType: "video/webm;codecs=vp8,opus" },
  { label: "WebM", mimeType: "video/webm" },
  { label: "MP4 · H.264", mimeType: "video/mp4;codecs=avc1.42E01E,mp4a.40.2" },
  { label: "MP4", mimeType: "video/mp4" },
];

export function availableFormats() {
  return CANDIDATES.filter(({ mimeType }) => MediaRecorder.isTypeSupported(mimeType));
}

export function extensionFor(mimeType) {
  return mimeType.startsWith("video/mp4") ? "mp4" : "webm";
}
