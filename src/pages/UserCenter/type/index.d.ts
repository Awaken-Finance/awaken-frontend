import { IContract, TokenInfo } from 'types';
import { RAISE_STATUS } from 'pages/IDO/utils/getRaiseStatus';
import { PairItem } from 'hooks/Exchange/useTradePair';

import { BaseFarmItem, FarmItemPool, LPToken, BaseToken } from 'pages/Farms/type';
import BigNumber from 'bignumber.js';

export interface TradePair {
  token0: {
    address: string;
    symbol: string;
    decimals: number;
    id: string;
  };
  token1: {
    address: string;
    symbol: string;
    decimals: number;
    id: string;
  };
  address: string;
  feeRate: number;
  id: string;
}
export interface IAssetDividendUser {
  depositAmount: string;
  id: string;
  poolBaseInfo: {
    id: string;
    pid: number;
    poolToken: TokenInfo;
    dividend: {
      id: string;
      chainId: string;
      address: string;
    };
  };
  walletBalance?: string;
  tokenContract?: IContract;
  userStaked?: string;
  depositAmount?: string;
  userTokens: {
    dividendToken: TokenInfo;
    accumulativeDividend: string;
  }[];
  apy?: number | string;
}

export interface IAssetIDO {
  asset: string;
  raisePrice: string;
  shares: BigNumber;
  estimate: BigNumber;
  raiseStatus: RAISE_STATUS;
  obtainAmount: string;
  reachLimit: boolean;
  claimed: boolean;
}

export interface BaseHeader {
  estimateAmount: string;
  estimateUSD: string;
}

export interface AssetBaseHeader {
  assetUSD: number;
  assetBTC: number;
}
export interface MyTradePairLiquidity {
  lpTokenAmount?: string;
  assetUSD?: string;
  token0Amount?: string;
  token1Amount?: string;
  id?: string;
  tradePair: TradePair;
  address: string;
}

export type MyTradePair = MyTradePairLiquidity & PairItem & { mineFunds: number | string };

export type ReducerAction = {
  type: 'UPDATE_ASSET_HIDDEN' | 'UPDATE_ASSET_ITEM' | 'UPDATE';
  value?: any;
};

export type UserCenterState = {
  userAssetHidden: boolean;
};
export interface GameOfTrustInterface {
  pid: number;
  unlockMarketCap: number;
  rewardRate: number;
  unlockCycle: number;
  unlockHeight: number;
  totalAmountLimit: number;
  startHeight: number;
  endHeight: number;
  blocksDaily: number;
  depositToken: {
    address: string;
    symbol: string;
    decimals: number;
    id: string;
  };
  harvestToken: {
    address: string;
    symbol: string;
    decimals: 6;
    id: string;
  };
  address: string;
  id: string;
}

export interface IAssetFarms extends BaseFarmItem {
  accHarvest: PendingHarvest;
  token1: BaseToken;
  token2: BaseToken;
}
export interface IAssetFarmResponse {
  accumulativeDividendProjectTokenAmount: string;
  accumulativeDividendUsdtAmount: string;
  farmInfo: {
    farmType: string;
  };
  poolInfo: {
    pid: number;
    poolType: number;
  };
  poolDetailInfo: {
    apy1: number;
    apy2: number;
    totalDepositAmount: string;
    accumulativeDividendProjectToken: string;
    accumulativeDividendUsdt: string;
  };
  swapToken: LPToken;
  token1: BaseToken;
  token2: BaseToken;
}

export interface PendingToken {
  amount: string;
  symbol: string;
  decimals: string;
  address: string;
}

export { FarmItemPool };

export interface RecentTransaction {
  tradePair: TradePair;
  side?: number;
  price?: string;
  token0Amount?: string;
  token1Amount?: string;
  token1PriceInUsd?: string;
  timestamp?: string;
  transactionHash?: string;
  transactionFee?: number;
  id?: string;
  totalPriceInUsd?: number;
  totalFee?: number;
}

export interface GetRecentTransactionParams {
  chainId?: string | null | undefined;
  type?: string | number | null | undefined;
  skipCount?: number;
  maxResultCount?: number;
  address?: string | null | undefined;
  sorting?: string | null;
  tokenSymbol?: string;
  searchTokenSymbol?: string;
  side?: number | null;
  transactionHash?: string | undefined | null;
}

export interface LiquidityRecord {
  tradePair: TradePair;
  type?: string | number | null | undefined;
  timestamp?: string;
  token0Amount?: string;
  token1Amount?: string;
  lpTokenAmount?: string;
  transactionHash?: string;
  transactionFee?: number;
}

export interface LiquidityRecordParams {
  chainId?: string | null | undefined;
  address?: string | null | undefined;
  tokenSymbol?: string;
  type?: string | number | null | undefined;
  skipCount?: number;
  maxResultCount?: number;
  sorting?: string | null;
  searchTokenSymbol?: string;
  side?: number | null;
}

export interface GetUserAssetTokenResult {
  address: string;
  tokenSymbol: string;
}

export interface SetUserAssetTokenParams {
  address: string;
  tokenSymbol: string;
}
