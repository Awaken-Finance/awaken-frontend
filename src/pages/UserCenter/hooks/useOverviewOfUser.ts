import { ZERO } from 'constants/misc';
import { useMemo } from 'react';
import { useExchangeAsset } from './useExchangeOfUser';

export type AssetAllKey = keyof typeof accountList;

export const accountList = {
  all: 'totalNetVal',
};

export default function useOverviewAsset(): { [x in AssetAllKey]: any } {
  const exchange = useExchangeAsset(1);

  return useMemo(() => {
    return {
      all: ZERO.plus(exchange.assetUSD),
      exchange,
    };
  }, [exchange]);
}
