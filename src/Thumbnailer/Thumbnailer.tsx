import { useEffect, useRef, useState } from 'react';
import { makeThumbData, prepareCanvas, ThumbData } from './makeThumbData';
import { makeThumbList } from './makeThumbList';

class TypeGuardException extends Error {}

interface ThumbnailerProps {
  objectURL: string;
}
function Thumbnailer({ objectURL }: ThumbnailerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [thumbData, setThumbData] = useState<ThumbData>({});

  useEffect(() => {
    if (!videoRef.current || !canvasRef.current) throw new TypeGuardException();
    const [video, canvas] = [videoRef.current, canvasRef.current];
    video.src = objectURL;

    const onLoadedMetadata = async () => {
      const durationSec = video.duration;
      const thumblist = makeThumbList(durationSec);
      const { ctx } = prepareCanvas({ video, canvas });
      const thumbData = await makeThumbData({ thumblist, video, canvas, ctx });
      setThumbData(thumbData);
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
        {Object.entries(thumbData).map(([timestamp, blob]) => {
          return (
            <Thumbnail key={timestamp} timestamp={timestamp} blob={blob} />
          );
        })}
      </div>
    </div>
  );
}

interface ThumbnailProps {
  timestamp: string;
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
    <div style={{ width: '160px', margin: '2px' }}>
      <p>{timestamp}</p>
      <img ref={imageRef} style={{ width: '100%' }} />
    </div>
  );
}

export default Thumbnailer;
