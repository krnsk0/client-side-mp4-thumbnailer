import { useState } from 'react';
import FilePicker from './FilePicker/FilePicker';
import Thumbnailer from './Thumbnailer/Thumbnailer';

function App() {
  const [objectURL, setObjectURL] = useState<string>('');
  return (
    <div>
      <FilePicker setObjectURL={setObjectURL} />
      <Thumbnailer objectURL={objectURL} />
    </div>
  );
}

export default App;
