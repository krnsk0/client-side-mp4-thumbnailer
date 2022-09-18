import { useEffect, useRef } from 'react';
import { TypeGuardException } from '../shared/errors';

interface UseFileInputOptions {
  onSelection: (file: File | undefined) => void;
}

export function useFileInput({ onSelection }: UseFileInputOptions) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const selectionHandler = (event: Event) => {
      if (!(event.target instanceof HTMLInputElement))
        throw new TypeGuardException();

      if (event.target.files) {
        const firstFile = event.target.files[0];
        onSelection(firstFile);
      }
    };

    if (inputRef.current) {
      inputRef.current.addEventListener('input', selectionHandler);
    }
    return () => {
      if (inputRef.current) {
        inputRef.current.removeEventListener('input', selectionHandler);
      }
    };
  }, []);

  return { inputRef };
}
