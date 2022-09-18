interface PrepareCanvas {
  video: HTMLVideoElement;
  canvas: HTMLCanvasElement;
}

const DOWNSCALE_FACTOR = 4;

export function prepareCanvas({ canvas, video }: PrepareCanvas) {
  canvas.width = video.videoWidth / DOWNSCALE_FACTOR;
  canvas.height = video.videoHeight / DOWNSCALE_FACTOR;
  return {
    ctx: canvas.getContext('2d')!,
  };
}
