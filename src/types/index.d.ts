import type { ERCToken, ELFChainToken, WrappedTokenInfo } from '@awaken/sdk-core';
import type { ContractInterface } from 'utils/contract';
export type IContract = ContractInterface | ContractBasic | null | undefined;

interface RoutesProps {
  path: string;
  exact?: boolean;
  strict?: boolean;
  component: any;
  authComp?: any;
}

export interface TokenInfo {
  address: string;
  symbol: string;
  decimals: number;
  id: string;
}
export type Token = ERCToken | ELFChainToken | WrappedTokenInfo;
export type LendingTokens = {
  [key: string]: {
    address: string;
    decimals: number;
  };
};
export type DepositToken = {
  symbol: string;
  address: string | string[];
  decimals?: number;
  name?: string;
};

export type ChainType = 'ERC' | 'ELF';

export type AElfContract = {
  sendContract: any;
  viewContract: any;
};

export interface PairToken {
  id: string;
  address: string;
  symbol: string;
  decimals: number;
  chainId: string;
}

export interface PairItem {
  token0: PairToken;
  token1: PairToken;
  price: number;
  priceUSD: number;
  pricePercentChange24h: number;
  priceHigh24h: number;
  priceHigh24hUSD: number;
  priceLow24h: number;
  priceLow24hUSD: number;
  volume24h: number; // // token0
  volumePercentChange24h: number;
  tvl: number;
  tvlPercentChange24h: number;
  valueLocked0: number;
  valueLocked1: number;
  tradeCount24h: number;
  tradeAddressCount24h: number;
  feePercent7d: number;
  feeRate: number;
  address: string;
  id: string;
  totalSupply: string;
  tradeValue24h: number; // token1
  priceChange24h: number;

  chainId: string;
  isFav: boolean;
  favId?: string | null;
}

export interface PoolItem extends PairItem {
  chainId: string;
}

export interface PinnedToken {
  tokenId: string;
  address: string;
  symbol: string;
  order: number;
}
