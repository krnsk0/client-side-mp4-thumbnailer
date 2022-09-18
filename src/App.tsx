import { useState } from 'react';
import FileLoader from './FileLoader/FileLoader';
import Thumbnailer from './Thumbnailer/Thumbnailer';

function App() {
  const [objectURL, setObjectURL] = useState<string>('');
  console.log('objectURL: ', objectURL);
  return (
    <div>
      <FileLoader setObjectURL={setObjectURL} />
      <Thumbnailer objectURL={objectURL} />
    </div>
  );
}

export default App;
