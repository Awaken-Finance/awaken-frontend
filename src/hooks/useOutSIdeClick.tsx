import { useCallback, useEffect, useRef } from 'react';

export default function useOutSideClick(callback: () => void) {
  const ref = useRef<any>();

  const handleClick = useCallback(
    (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    },
    [callback],
  );

  useEffect(() => {
    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, [handleClick, ref]);

  return ref;
}
