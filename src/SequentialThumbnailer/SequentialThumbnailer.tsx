import { useEffect, useReducer, useRef } from 'react';
import { TypeGuardException } from '../shared/errors';
import { makeThumbList } from '../shared/makeThumbList';
import Thumbnail from '../shared/Thumbnail';
import { prepareCanvas } from './prepareCanvas';
import { seek } from './seek';

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

function SequentialThumbnailer({ objectURL }: ThumbnailerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [thumbData, thumbDispatch] = useReducer(reducer, []);

  useEffect(() => {
    if (!videoRef.current || !canvasRef.current) throw new TypeGuardException();
    const [video, canvas] = [videoRef.current, canvasRef.current];
    video.src = objectURL;

    const onLoadedMetadata = async () => {
      const durationSec = video.duration;
      const thumblist = makeThumbList(durationSec);
      const { ctx } = prepareCanvas({ video, canvas });
      for (const timestamp of thumblist) {
        await seek(video, timestamp);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              thumbDispatch({
                type: PUSH_NEW,
                data: {
                  timestamp,
                  blob,
                },
              });
            }
          },
          'image/jpeg',
          0.95
        );
      }
    };

    video.addEventListener('loadedmetadata', onLoadedMetadata);

    return () => {
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
    };
  }, [objectURL]);

  return (
    <div
      style={{ border: '1px solid black', padding: '5px', marginTop: '1em' }}
    >
      <p>sequential video -{'>'} canvas thumbnailer</p>
      <video ref={videoRef} controls={false} style={{ display: 'none' }} />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
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

export default SequentialThumbnailer;
