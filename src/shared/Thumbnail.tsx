import { useEffect, useRef } from 'react';
import { TypeGuardException } from './errors';

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

export default Thumbnail;
