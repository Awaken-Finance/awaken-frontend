import BigNumber from 'bignumber.js';
import { getPairList } from 'pages/Overview/apis/getPairList';
import useSWR from 'swr';

export default function useCurrentPair(pair: string, chainId: string) {
  const [token0Symbol, token1Symbol, feeRate] = pair?.split('_') || ['ELF', 'USDT', '0.05'];
  const fee = new BigNumber(feeRate ?? '').div(100).toFormat();
  const { data, isLoading, error } = useSWR(['liquidity/manager/pair', token0Symbol, token1Symbol], () => {
    return getPairList({ token0Symbol, token1Symbol, feeRate: fee, chainId });
  });

  return {
    pairItem: data && data.items && data.items.length ? data.items[0] : undefined,
    isLoading,
    error,
  };
}
