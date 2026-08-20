const MEGABYTE = 1024 * 1024;

const pad = (value) => String(value).padStart(2, "0");

export function formatDuration(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(seconds / 3600);
  const clock = [Math.floor(seconds / 60) % 60, seconds % 60];

  return (hours > 0 ? [hours, ...clock] : clock).map(pad).join(":");
}

export function formatSize(bytes) {
  if (bytes === 0) return "";
  return `${(bytes / MEGABYTE).toFixed(1)} MB`;
}

export function recordingName(extension) {
  const now = new Date();
  const stamp = [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    `${pad(now.getHours())}${pad(now.getMinutes())}`,
  ].join("-");

  return `crisrecorder-${stamp}.${extension}`;
}
