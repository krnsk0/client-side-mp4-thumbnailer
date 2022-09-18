import { useFileInput } from './useFileInput';

interface FileLoaderProps {
  setObjectURL: (url: string) => void;
}

function FilePicker({ setObjectURL }: FileLoaderProps) {
  const { inputRef } = useFileInput({
    onSelection: (file) => {
      if (file) {
        const url = URL.createObjectURL(file);
        setObjectURL(url);
      }
    },
  });
  const chooseFile = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const loadSampleFile = async () => {
    try {
      const response = await fetch('./sync.mp4');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setObjectURL(url);
    } catch (error: unknown) {
      console.error(error);
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        id="file"
        accept="video/mp4"
        style={{ display: 'none' }}
      />
      <button type="button" onClick={chooseFile}>
        choose mp4 file
      </button>
      <button type="button" onClick={loadSampleFile}>
        load sync.mp4
      </button>
    </>
  );
}

export default FilePicker;
