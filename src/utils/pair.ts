import { PairItem, TokenInfo } from 'types';
import { getTokenWeights } from './token';
import { Currency } from '@awaken/sdk-core';
import { ONE, ZERO } from 'constants/misc';

export function getPairsOrderByTokenWeights(
  token0?: TokenInfo | string,
  token1?: TokenInfo | string,
): Array<TokenInfo | string | undefined> {
  if (!token0 || !token1) {
    return [token0, token1];
  }

  return getTokenWeights(typeof token0 === 'string' ? token0 : token0.symbol) >=
    getTokenWeights(typeof token1 === 'string' ? token1 : token1.symbol)
    ? [token1, token0]
    : [token0, token1];
}

export function getPairsLogoOrderByTokenWeights(
  tokens: Array<{ symbol?: string; currency?: Currency | null; address?: string; src?: string }>,
): Array<{ symbol?: string; currency?: Currency | null; address?: string; src?: string }> {
  // if ((!tokens[0]?.symbol && !tokens[0].currency?.symbol) || (!tokens[1]?.symbol && !tokens[1].currency?.symbol)) {
  //   return tokens;
  // }

  // return getTokenWeights(tokens[0]?.symbol || tokens[0].currency?.symbol) >=
  //   getTokenWeights(tokens[1]?.symbol || tokens[1].currency?.symbol)
  //   ? tokens.reverse()
  //   : tokens;
  return tokens;
}

export const getIsReversed = (token0: string | TokenInfo, token1: string | TokenInfo) => {
  return (
    getTokenWeights(typeof token0 === 'string' ? token0 : token0.symbol) >=
    getTokenWeights(typeof token1 === 'string' ? token1 : token1.symbol)
  );
};

export const getPairReversed = (_pair: PairItem) => {
  const pair = { ..._pair };

  const isReversed = getIsReversed(pair.token0, pair.token1);
  if (isReversed) {
    pair.originToken0 = { ..._pair.token0 };
    pair.originToken1 = { ..._pair.token1 };
    const token0 = { ...pair.token0 };
    const token1 = { ...pair.token1 };
    pair.token0 = token1;
    pair.token1 = token0;
    pair.valueLocked0 = _pair.valueLocked1;
    pair.valueLocked1 = _pair.valueLocked0;

    pair.price = ONE.div(_pair.price).toNumber();

    pair.priceUSD = ONE.div(_pair.price).times(_pair.priceUSD).toNumber();
    // TODO
    pair.priceHigh24h = ONE.div(_pair.priceLow24h).toNumber();
    pair.priceLow24h = ONE.div(_pair.priceHigh24h).toNumber();

    pair.pricePercentChange24h = ONE.div(_pair.pricePercentChange24h + 1)
      .minus(1)
      .toNumber();
  }

  return pair;
};
