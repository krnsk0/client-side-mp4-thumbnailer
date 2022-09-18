export async function seek(
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
