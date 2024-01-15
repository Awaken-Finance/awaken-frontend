import { useMemo } from 'react';
import { useStore } from '.';
export function useBlockHeight() {
  const [{ blockHeight }] = useStore();
  return useMemo(() => blockHeight, [blockHeight]);
}
