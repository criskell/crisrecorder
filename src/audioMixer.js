const silent = { tracks: [], dispose() {} };

export function mixAudio(streams) {
  const sources = streams.filter((stream) => stream.getAudioTracks().length > 0);

  if (sources.length === 0) return silent;
  if (sources.length === 1) return { tracks: sources[0].getAudioTracks(), dispose() {} };

  const context = new AudioContext();
  const destination = context.createMediaStreamDestination();
  sources.forEach((stream) => context.createMediaStreamSource(stream).connect(destination));

  return {
    tracks: destination.stream.getAudioTracks(),
    dispose: () => context.close(),
  };
}
