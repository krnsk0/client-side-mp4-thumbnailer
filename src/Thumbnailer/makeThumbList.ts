const THUMB_RESOLUTION = 1;

export function makeThumbList(durationSec: number): number[] {
  const thumblist = [];
  let time = 0;
  while (time < durationSec) {
    thumblist.push(time);
    time += THUMB_RESOLUTION;
  }
  return thumblist;
}
