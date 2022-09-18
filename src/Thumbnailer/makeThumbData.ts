export interface ThumbData {
  [timestamp: string]: Blob;
}

interface PrepareCanvas {
  video: HTMLVideoElement;
  canvas: HTMLCanvasElement;
}

interface IThumbData {
  thumblist: number[];
  video: HTMLVideoElement;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
}

export function prepareCanvas({ canvas, video }: PrepareCanvas) {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  return {
    ctx: canvas.getContext('2d')!,
  };
}

async function seek(
  video: HTMLVideoElement,
  timestampSec: number
): Promise<void> {
  video.currentTime = timestampSec;
  return new Promise((res) => {
    video.addEventListener(
      'seeked',
      () => {
        res();
      },
      { once: true }
    );
  });
}

export async function makeThumbData({
  thumblist,
  video,
  canvas,
  ctx,
}: IThumbData): Promise<ThumbData> {
  const thumbData: ThumbData = {};

  for (const thumbtime of thumblist) {
    await seek(video, thumbtime);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          thumbData[thumbtime] = blob;
        }
        console.log(
          `generated ${Object.keys(thumbData).length} of ${thumblist.length}`
        );
      },
      'image/jpeg',
      0.95
    );
  }

  return thumbData;
}
