export interface SerializedToken {
  chainId: number | string;
  address: string;
  decimals: number;
  symbol: string;
  name?: string;
}
