import { SYMBOL_FORMAT_MAP } from 'constants/misc';

const tokenWeights: { [key: string]: number } = {
  USDT: 100,
  USDC: 90,
  DAI: 80,
  ELF: 60,
  ETH: 50,
  BNB: 30,
};

export function getTokenWeights(symbol?: string): number {
  if (!symbol) {
    return 0;
  }

  return tokenWeights[symbol] || 1;
}

export function getTokensOrderByASCLL(symbol1?: string, symbol2?: string) {
  if (!symbol1 || !symbol2) {
    return { symbol1, symbol2 };
  }

  return symbol1 > symbol2 ? { symbol1: symbol2, symbol2: symbol1 } : { symbol1, symbol2 };
}

export const formatSymbol = (symbol = '') => {
  if (SYMBOL_FORMAT_MAP[symbol]) return SYMBOL_FORMAT_MAP[symbol];
  return symbol;
};

export const getTVSymbolName = (pathSymbol = '') => {
  const arr = pathSymbol.split('_');
  return arr.map((item) => formatSymbol(item)).join('/');
};
