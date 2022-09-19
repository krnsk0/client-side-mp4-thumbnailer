import MP4Box, {
  MP4ArrayBuffer,
  MP4File,
  MP4Info,
  MP4VideoTrack,
  Sample,
} from 'mp4box';

class Writer {
  data: Uint8Array;
  idx: number;
  size: number;

  constructor(size: number) {
    this.data = new Uint8Array(size);
    this.idx = 0;
    this.size = size;
  }

  getData(): Uint8Array {
    if (this.idx != this.size)
      throw 'Mismatch between size reserved and sized used';
    return this.data.slice(0, this.idx);
  }

  writeUint8(value: number): void {
    this.data.set([value], this.idx);
    this.idx++;
  }

  writeUint16(value: number): void {
    const arr = new Uint16Array(1);
    arr[0] = value;
    const buffer = new Uint8Array(arr.buffer);
    this.data.set([buffer[1], buffer[0]], this.idx);
    this.idx += 2;
  }

  writeUint8Array(value: Uint8Array): void {
    this.data.set(value, this.idx);
    this.idx += value.length;
  }
}

/**
 * Adapted from
 * {@link} https://github.com/w3c/webcodecs/blob/main/samples/video-decode-display/demuxer_mp4.js
 */

async function makeFile(blob: Blob): Promise<{ file: MP4File; info: MP4Info }> {
  const file = MP4Box.createFile();
  const buffer = (await blob.arrayBuffer()) as MP4ArrayBuffer;
  buffer.fileStart = 0;

  return new Promise((resolve, reject) => {
    file.onReady = (info: MP4Info) => {
      resolve({ file, info });
    };

    file.onError = (error: string) => {
      reject();
    };

    file.appendBuffer(buffer);
    file.flush();
  });
}

class AvccNotFoundError extends Error {}

// only handles h264
function getDescription(file: MP4File, track: MP4VideoTrack) {
  const avccBox = file.moov.traks[0].mdia.minf.stbl.stsd.entries[0].avcC;
  if (!avccBox) throw new AvccNotFoundError();

  let i;
  let size = 7;
  for (i = 0; i < avccBox.SPS.length; i++) {
    // nalu length is encoded as a uint16.
    size += 2 + avccBox.SPS[i].length;
  }
  for (i = 0; i < avccBox.PPS.length; i++) {
    // nalu length is encoded as a uint16.
    size += 2 + avccBox.PPS[i].length;
  }
  const writer = new Writer(size);
  writer.writeUint8(avccBox.configurationVersion);
  writer.writeUint8(avccBox.AVCProfileIndication);
  writer.writeUint8(avccBox.profile_compatibility);
  writer.writeUint8(avccBox.AVCLevelIndication);
  writer.writeUint8(avccBox.lengthSizeMinusOne + (63 << 2));
  writer.writeUint8(avccBox.nb_SPS_nalus + (7 << 5));
  for (i = 0; i < avccBox.SPS.length; i++) {
    writer.writeUint16(avccBox.SPS[i].length);
    writer.writeUint8Array(avccBox.SPS[i].nalu);
  }
  writer.writeUint8(avccBox.nb_PPS_nalus);
  for (i = 0; i < avccBox.PPS.length; i++) {
    writer.writeUint16(avccBox.PPS[i].length);
    writer.writeUint8Array(avccBox.PPS[i].nalu);
  }
  return writer.getData();
}

interface DemuxerOptions {
  onDecoderConfigReady: (config: VideoDecoderConfig) => void;
  onChunk: (chunk: EncodedVideoChunk) => void;
}

export async function demux(
  blob: Blob,
  { onDecoderConfigReady, onChunk }: DemuxerOptions
) {
  const { file, info } = await makeFile(blob);
  const track = info.videoTracks[0];

  onDecoderConfigReady({
    codec: track.codec,
    codedHeight: track.video.height,
    codedWidth: track.video.width,
    description: getDescription(file, track),
  });

  file.onSamples = (trackId: number, user: any, samples: Sample[]) => {
    for (const sample of samples) {
      onChunk(
        new EncodedVideoChunk({
          type: sample.is_sync ? 'key' : 'delta',
          timestamp: (1000 * sample.cts) / sample.timescale,
          duration: (1000 * sample.duration) / sample.timescale,
          data: sample.data,
        })
      );
    }
  };

  file.setExtractionOptions(track.id);
  file.start();
}
