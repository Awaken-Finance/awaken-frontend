const tokenWeights: { [key: string]: number } = {
  USDT: 100,
  USDC: 90,
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