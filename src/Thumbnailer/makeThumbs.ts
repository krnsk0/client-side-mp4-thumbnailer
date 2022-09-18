import { seek } from './seek';

export interface ThumbnailData {
  timestamp: string;
  blob: Blob;
}

interface IMakeThumbs {
  thumblist: number[];
  video: HTMLVideoElement;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  pushThumbnail: (newThumb: ThumbnailData) => void;
}

export async function makeThumbs({
  thumblist,
  video,
  canvas,
  ctx,
  pushThumbnail,
}: IMakeThumbs): Promise<void> {}
