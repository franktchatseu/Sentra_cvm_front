import { useEffect, RefObject } from 'react';

interface UseClickOutsideOptions {
  enabled?: boolean;
}

export const useClickOutside = (
  ref: RefObject<HTMLElement>,
  callback: () => void,
  options: UseClickOutsideOptions = {}
) => {
  const { enabled = true } = options;

  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, callback, enabled]);
};

export default useClickOutside;
