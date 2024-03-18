import { TokenInfo } from 'types';
import { getTokenWeights } from './token';
import { Currency } from '@awaken/sdk-core';

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
  if ((!tokens[0]?.symbol && !tokens[0].currency?.symbol) || (!tokens[1]?.symbol && !tokens[1].currency?.symbol)) {
    return tokens;
  }

  return getTokenWeights(tokens[0]?.symbol || tokens[0].currency?.symbol) >=
    getTokenWeights(tokens[1]?.symbol || tokens[1].currency?.symbol)
    ? tokens.reverse()
    : tokens;
}
