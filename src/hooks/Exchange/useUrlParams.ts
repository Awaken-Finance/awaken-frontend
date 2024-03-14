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
    const tokens = getPairsOrderByTokenWeights(pairInfo?.token0, pairInfo?.token1);

    if (pairInfo) {
      return {
        id: pairInfo.id,
        symbol: `${unifyWTokenSymbol(tokens[0] as TokenInfo)}_${unifyWTokenSymbol(tokens[1] as TokenInfo)}`,
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
