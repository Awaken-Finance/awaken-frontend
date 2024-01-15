import { useMemo } from 'react';
import { SupportedSwapRateKeys, SupportedSwapRateKeysIndex } from 'constants/swap';
import { unifyWTokenSymbol } from 'utils';
import { usePairInfo } from 'pages/Exchange/hooks/useSwap';
import BigNumber from 'bignumber.js';

export interface SymbolItem {
  id?: string;
  symbol?: string;
  feeRate?: string;
}

export function useUrlParams() {
  const pairInfo = usePairInfo();

  return useMemo(() => {
    if (pairInfo) {
      return {
        id: pairInfo.id,
        symbol: `${unifyWTokenSymbol(pairInfo.token0)}_${unifyWTokenSymbol(pairInfo.token1)}`,
        feeRate:
          SupportedSwapRateKeys[
            (new BigNumber(pairInfo?.feeRate).times(100).toString() + '%') as SupportedSwapRateKeysIndex
          ],
      };
    }
    return {
      id: '',
      symbol: '',
      feeRate: '',
    };
  }, [pairInfo]);
}
