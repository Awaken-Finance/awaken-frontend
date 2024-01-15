import { request } from 'api';
import { ChainConstants } from 'constants/ChainConstants';
import { useActiveWeb3React } from 'hooks/web3';
import { useCallback, useEffect, useMemo } from 'react';
import { useTokenPrices } from '.';
import { basicTokenPricesView } from './actions';

type Token = {
  tokenId?: string;
  tokenAddress?: string;
  symbol?: string;
};
export function useTokenPrice({ tokenId, tokenAddress, symbol }: Token) {
  const [{ tokenPrices }, { dispatch }] = useTokenPrices();
  const { chainId, apiChainId } = useActiveWeb3React();
  const chainTokenPrices = useMemo(() => tokenPrices?.[chainId] || {}, [chainId, tokenPrices]);
  const key = tokenId || tokenAddress || symbol || '';
  const previousPrice = (tokenPrices && tokenPrices[key]) || 0;

  const getTokenPrice = useCallback(async () => {
    if (!key) return;
    const resp: any = await request.token.GET_TOKEN_PRICE({
      params: {
        chainId: apiChainId,
        tokenId,
        TokenAddress: ChainConstants.chainType === 'ELF' ? ChainConstants.constants.TOKEN_CONTRACT : tokenAddress,
        Symbol: symbol,
      },
    });
    const price = resp.data || previousPrice || 0;
    if (!isNaN(price)) dispatch(basicTokenPricesView.setTokenPrice.actions({ [key]: price }));
  }, [apiChainId, dispatch, key, symbol, tokenAddress, tokenId, previousPrice]);

  useEffect(() => {
    getTokenPrice();
  }, [dispatch, getTokenPrice, chainId]);
  return useMemo(() => chainTokenPrices[key] || '0', [chainTokenPrices, key]);
}
interface FarmTokenBack {
  chainId: string;
  tokenAddress: string;
  price: string;
}

export function useFarmTokenPrice(LpTokenAddress: string[]) {
  const [{ tokenPrices }, { dispatch }] = useTokenPrices();
  const { chainId, apiChainId } = useActiveWeb3React();
  const chainTokenPrices = useMemo(
    () => LpTokenAddress.map((item) => tokenPrices?.[chainId]?.[item]),
    [LpTokenAddress, chainId, tokenPrices],
  );
  const getTokenPrice = useCallback(async () => {
    const url = `?chainId=${apiChainId}&${LpTokenAddress.map((item) => 'tokenAddresses=' + item + '&').join('')}`;
    const res: any = await request.token.GET_FARM_TOKEN_PRICE({
      query: url.slice(0, -1),
    });
    if (!res || !res?.[0]) {
      return;
    }
    let priceMap: { [key: string]: string } = {};
    res &&
      res.forEach((item: FarmTokenBack) => {
        priceMap = {
          ...priceMap,
          [item.tokenAddress]: item.price,
        };
      });
    dispatch(basicTokenPricesView.setTokenPrice.actions(priceMap));
  }, [LpTokenAddress, apiChainId, dispatch]);

  useEffect(() => {
    getTokenPrice();
  }, [dispatch, getTokenPrice, chainId]);

  return useMemo(() => chainTokenPrices, [chainTokenPrices]);
}

export function useTokenUSDPrice(symbol: string) {
  const price = useTokenPrice({ symbol });
  return useMemo(() => price, [price]);
}

export function useBTCPrice() {
  return useTokenUSDPrice('BTC');
}
