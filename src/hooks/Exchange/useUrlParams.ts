import { useMemo } from 'react';
import { SupportedSwapRateKeys, SupportedSwapRateKeysIndex } from 'constants/swap';
import { unifyWTokenSymbol } from 'utils';
import { usePairInfo } from 'pages/Exchange/hooks/useSwap';
import BigNumber from 'bignumber.js';
import { getPairsOrderByTokenWeights } from 'utils/pair';
import { TokenInfo } from 'types';

export interface SymbolItem {
  id?: string;
  symbol?: string;
  feeRate?: string;
}

export function useUrlParams() {
  const pairInfo = usePairInfo();

  return useMemo(() => {
    if (pairInfo) {
      const token0 = pairInfo.token0;
      const token1 = pairInfo.token1;

      return {
        id: pairInfo.id,
        symbol: `${unifyWTokenSymbol(token0 as TokenInfo)}_${unifyWTokenSymbol(token1 as TokenInfo)}`,
        feeRate:
          SupportedSwapRateKeys[
            (new BigNumber(pairInfo?.feeRate).times(100).toString() + '%') as SupportedSwapRateKeysIndex
          ],
        isReversed: token0 !== pairInfo.originToken0,
      };
    }
    return {
      id: '',
      symbol: '',
      feeRate: '',
      isReversed: false,
    };
  }, [pairInfo]);
}
