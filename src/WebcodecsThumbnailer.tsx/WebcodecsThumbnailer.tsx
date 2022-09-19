import { useEffect, useReducer, useRef } from 'react';
import { TypeGuardException } from '../shared/errors';
import { makeThumbList } from '../shared/makeThumbList';
import Thumbnail from '../shared/Thumbnail';
import { demux } from './demux';

interface ThumbnailerProps {
  objectURL: string;
}

export interface ThumbnailData {
  timestamp: number;
  blob: Blob;
}

const PUSH_NEW = 'push_new';

function reducer(
  state: ThumbnailData[],
  action: { type: string; data: ThumbnailData }
) {
  switch (action.type) {
    case PUSH_NEW:
      return [...state, action.data];
    default:
      throw new Error();
  }
}

function WebcodecsThumbnailer({ objectURL }: ThumbnailerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [thumbData, thumbDispatch] = useReducer(reducer, []);

  useEffect(() => {
    (async () => {
      const response = await fetch(objectURL);
      const blob = await response.blob();

      const decoder = new VideoDecoder({
        output: (frame: VideoFrame) => {
          console.log('timestamp', frame.timestamp);
          frame.close();
        },
        error: (error) => {
          throw error;
        },
      });

      await demux(blob, {
        onDecoderConfigReady: (config) => {
          console.log('configuring decoder', config);
          decoder.configure(config);
        },
        onChunk: (chunk) => {
          decoder.decode(chunk);
        },
      });

      await decoder.flush();
      console.log('DONE');
    })();
  }, [objectURL]);

  return (
    <div
      style={{ border: '1px solid black', padding: '5px', marginTop: '1em' }}
    >
      <p>webcodecs thumbnailer</p>
      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
        {thumbData.map(({ timestamp, blob }) => {
          return (
            <Thumbnail key={timestamp} timestamp={timestamp} blob={blob} />
          );
        })}
      </div>
    </div>
  );
}

export default WebcodecsThumbnailer;
