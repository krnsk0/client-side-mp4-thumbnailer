import { useState } from 'react';
import FilePicker from './FilePicker/FilePicker';
import SequentialThumbnailer from './SequentialThumbnailer/SequentialThumbnailer';

function App() {
  const [objectURL, setObjectURL] = useState<string>('');
  return (
    <div>
      <FilePicker setObjectURL={setObjectURL} />
      <p>creating thumbs every 1000ms</p>
      <SequentialThumbnailer objectURL={objectURL} />
    </div>
  );
}

export default App;
