import { PairItem, TokenInfo } from 'types';
import { getTokenWeights } from './token';
import { Currency } from '@awaken/sdk-core';
import { ONE, ZERO } from 'constants/misc';
import BigNumber from 'bignumber.js';
import lodash from 'lodash';
import { TTradePair } from 'types/pair';

export function getPairsOrderByTokenWeights(
  token0?: TokenInfo | string,
  token1?: TokenInfo | string,
): Array<TokenInfo | string | undefined> {
  if (!token0 || !token1) {
    return [token0, token1];
  }

  return getTokenWeights(typeof token0 === 'string' ? token0 : token0.symbol) >
    getTokenWeights(typeof token1 === 'string' ? token1 : token1.symbol)
    ? [token1, token0]
    : [token0, token1];
}

export function getPairsLogoOrderByTokenWeights(
  tokens: Array<{ symbol?: string; currency?: Currency | null; address?: string; src?: string }>,
): Array<{ symbol?: string; currency?: Currency | null; address?: string; src?: string }> {
  if ((!tokens[0]?.symbol && !tokens[0].currency?.symbol) || (!tokens[1]?.symbol && !tokens[1].currency?.symbol)) {
    return tokens;
  }

  return getTokenWeights(tokens[0]?.symbol || tokens[0].currency?.symbol) >
    getTokenWeights(tokens[1]?.symbol || tokens[1].currency?.symbol)
    ? tokens.reverse()
    : tokens;
}

export const getIsReversed = (token0: string | TokenInfo, token1: string | TokenInfo) => {
  return (
    getTokenWeights(typeof token0 === 'string' ? token0 : token0.symbol) >
    getTokenWeights(typeof token1 === 'string' ? token1 : token1.symbol)
  );
};

export const getPairReversed = (_pair: PairItem) => {
  if (!getIsReversed(_pair.token0, _pair.token1)) {
    return _pair;
  }

  const pair = lodash.cloneDeep(_pair);

  pair.originToken0 = { ..._pair.token0 };
  pair.originToken1 = { ..._pair.token1 };
  const token0 = { ...pair.token0 };
  const token1 = { ...pair.token1 };
  pair.token0 = token1;
  pair.token1 = token0;
  pair.valueLocked0 = _pair.valueLocked1;
  pair.valueLocked1 = _pair.valueLocked0;

  pair.price = new BigNumber(_pair.valueLocked0).div(_pair.valueLocked1).toNumber();

  pair.priceUSD = new BigNumber(pair.price).times(_pair.priceUSD).toNumber();
  // TODO
  pair.priceHigh24h = ONE.div(_pair.priceLow24h).toNumber();
  pair.priceLow24h = ONE.div(_pair.priceHigh24h).toNumber();
  pair.priceHigh24hUSD = ZERO.plus(pair.priceHigh24h).times(_pair.priceUSD).toNumber();
  pair.priceLow24hUSD = ZERO.plus(pair.priceLow24h).times(_pair.priceUSD).toNumber();

  pair.priceChange24h = ZERO.minus(_pair.pricePercentChange24h).div(100).div(_pair.price).toNumber();

  pair.pricePercentChange24h = ZERO.minus(_pair.pricePercentChange24h)
    .div(new BigNumber(_pair.pricePercentChange24h).plus(100))
    .times(100)
    .toNumber();

  pair.volume24h = _pair.tradeValue24h;
  pair.tradeValue24h = _pair.volume24h;

  return pair;
};

export const getTokenFromPair = (pair: TTradePair, symbol: string) => {
  return pair.token0.symbol === symbol ? pair.token0 : pair.token1;
};
