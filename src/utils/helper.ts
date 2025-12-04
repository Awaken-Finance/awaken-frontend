import { useRef, useEffect, useState } from 'react';
export function useVerifyMounted<T>(initValue: T, asyncFn: () => Promise<{ data: T }>, refresh: number) {
  const isMounted = useRef(false);
  const [value, setValue] = useState<T>(initValue);
  useEffect(() => {
    isMounted.current = true;
    if (refresh) {
      asyncFn().then((res) => {
        if (isMounted.current && res.data) {
          setValue(res.data);
        }
      });
    }
    return () => {
      isMounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);
  return value;
}
export function useArgMountedToComp(asyncFn: (isMounted: React.MutableRefObject<boolean>) => void, refresh: number) {
  const isMounted = useRef(false);
  useEffect(() => {
    isMounted.current = true;
    if (refresh) {
      asyncFn(isMounted);
    }
    return () => {
      isMounted.current = false;
    };
  }, [asyncFn, refresh]);
}
