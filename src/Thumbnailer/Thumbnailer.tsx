import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { makeThumbList } from './makeThumbList';
import { prepareCanvas } from './prepareCanvas';
import { seek } from './seek';

class TypeGuardException extends Error {}

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

function Thumbnailer({ objectURL }: ThumbnailerProps) {
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
                  timestamp: timestamp.toString(),
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
    <div>
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

interface ThumbnailProps {
  timestamp: number;
  blob: Blob;
}

function Thumbnail({ timestamp, blob }: ThumbnailProps) {
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!imageRef.current) throw new TypeGuardException();
    const url = URL.createObjectURL(blob);
    imageRef.current.src = url;
    return () => {
      URL.revokeObjectURL(url);
    };
  }, []);

  return (
    <div style={{ width: '100px', margin: '0px' }}>
      <p
        style={{
          position: 'absolute',
          margin: '5px',
          color: 'white',
          backgroundColor: 'black',
          fontSize: '0.8em',
        }}
      >
        {timestamp * 1000}ms
      </p>
      <img ref={imageRef} style={{ width: '100%' }} />
    </div>
  );
}

export default Thumbnailer;
