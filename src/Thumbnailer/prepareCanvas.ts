interface PrepareCanvas {
  video: HTMLVideoElement;
  canvas: HTMLCanvasElement;
}

export function prepareCanvas({ canvas, video }: PrepareCanvas) {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  return {
    ctx: canvas.getContext('2d')!,
  };
}
