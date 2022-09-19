interface PrepareCanvas {
  canvas: HTMLCanvasElement;
  objectURL: string;
}

const DOWNSCALE_FACTOR = 4;

export async function prepareCanvas({
  canvas,
  objectURL,
}: PrepareCanvas): Promise<{
  ctx: CanvasRenderingContext2D;
  video: HTMLVideoElement;
}> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.src = objectURL;

    video.addEventListener('loadedmetadata', () => {
      canvas.width = video.videoWidth / DOWNSCALE_FACTOR;
      canvas.height = video.videoHeight / DOWNSCALE_FACTOR;
      resolve({ ctx: canvas.getContext('2d')!, video });
    });
  });
}
