import { Currency } from '@awaken/sdk-core';
import { useMemo } from 'react';
import { getLPSymbol } from 'utils/swap';

export default function useLPSymbol(tokenA?: Currency, tokenB?: Currency) {
  return useMemo(() => {
    if (!tokenA || !tokenB) return undefined;
    return getLPSymbol([tokenA, tokenB]);
  }, [tokenA, tokenB]);
}
