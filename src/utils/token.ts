import { IPFS_SYMBOL_LIST, IPFS_SYMBOL_MAP, SYMBOL_FORMAT_MAP } from 'constants/misc';

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

export const formatImageURI = (symbol: string, uri: string) => {
  const isIPFS = (uri || '').startsWith('ipfs://');
  if (!isIPFS) return uri;
  return getIPFSAssetsURI(symbol, uri);
};

export const getIPFSAssetsURI = (symbol = '', uri: string) => {
  const symbolPrefix = symbol.split('-')?.[0] || '';
  return `${IPFS_SYMBOL_MAP[symbolPrefix]}/${uri.slice(7)}`;
};

export const getImageFromTokenInfo = (tokenInfo: any) => {
  const symbol = tokenInfo?.symbol || '';
  const symbolPrefix = symbol.split('-')?.[0] || '';

  if (IPFS_SYMBOL_LIST.includes(symbolPrefix)) {
    return formatImageURI(symbol, tokenInfo?.externalInfo?.value?.__nft_image_uri || '');
  } else {
    return tokenInfo?.externalInfo?.value?.__ft_image_uri || tokenInfo?.externalInfo?.value?.__nft_image_url || '';
  }
};
