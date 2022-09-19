import { useEffect, useReducer, useRef } from 'react';
import { prepareCanvas } from './prepareCanvas';
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [thumbData, thumbDispatch] = useReducer(reducer, []);

  useEffect(() => {
    (async () => {
      const response = await fetch(objectURL);
      const blob = await response.blob();
      const canvas = canvasRef.current;
      if (!canvas) throw new TypeGuardException();
      const { ctx, video } = await prepareCanvas({ objectURL, canvas });
      const thumblist = makeThumbList(video.duration);
      let indexOfSoughtThumbnail = 0;

      const decoder = new VideoDecoder({
        output: (frame: VideoFrame) => {
          ctx.drawImage(frame, 0, 0, canvas.width, canvas.height);
          const timestamp = frame.timestamp;
          if (!timestamp) throw new TypeGuardException();

          const soughtThumbnail = thumblist[indexOfSoughtThumbnail] * 1000;

          if (timestamp >= soughtThumbnail) {
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  thumbDispatch({
                    type: PUSH_NEW,
                    data: {
                      timestamp: soughtThumbnail,
                      blob,
                    },
                  });
                }
              },
              'image/jpeg',
              0.95
            );
            indexOfSoughtThumbnail += 1;
          }

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
    })();
  }, [objectURL]);

  return (
    <div
      style={{ border: '1px solid black', padding: '5px', marginTop: '1em' }}
    >
      <p>webcodecs thumbnailer</p>
      <canvas
        ref={canvasRef}
        style={{
          display: 'none',
        }}
      />
      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
        {thumbData.map(({ timestamp, blob }) => {
          return (
            <Thumbnail
              key={timestamp}
              timestamp={timestamp / 1000}
              blob={blob}
            />
          );
        })}
      </div>
    </div>
  );
}

export default WebcodecsThumbnailer;
