import { useEffect, useState } from 'react';
import FilePicker from './FilePicker/FilePicker';
import SequentialThumbnailer from './SequentialThumbnailer/SequentialThumbnailer';
import WebcodecsThumbnailer from './WebcodecsThumbnailer.tsx/WebcodecsThumbnailer';

function App() {
  const [objectURL, setObjectURL] = useState<string>('');

  useEffect(() => {}, [objectURL]);

  return (
    <>
      <h1 style={{ fontSize: '1.2em' }}>
        client-side mp4 thumbnailing techniques
      </h1>
      <FilePicker setObjectURL={setObjectURL} />
      <SequentialThumbnailer objectURL={objectURL} />
      <WebcodecsThumbnailer objectURL={objectURL} />
    </>
  );
}

export default App;
