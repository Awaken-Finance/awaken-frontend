import { IContract, PairItem, TokenInfo } from 'types';
import { TPercentInfo } from 'pages/Swap/types';
import { TTradePair } from './pair';

export interface IAssetDividendUser {
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
  tradePair: TTradePair;
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

export interface RecentTransaction {
  tradePair: TTradePair;
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
  percentRoutes?: TPercentInfo[];
  labsFee?: number;
  labsFeeSymbol?: string;
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
  tradePair: TTradePair;
  type?: string | number | null | undefined;
  timestamp?: string;
  token0Amount?: string;
  token1Amount?: string;
  lpTokenAmount?: string;
  transactionHash?: string;
  transactionFee?: number;
  price?: string;
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

export type TLimitRecordParams = {
  makerAddress?: string | null | undefined;
  skipCount?: number;
  maxResultCount?: number;
  tokenSymbol?: string;
  limitOrderStatus?: number;
};

export enum LimitOrderStatusEnum {
  Committed = 1,
  PartiallyFilling = 2,
  FullFilled = 3,
  Cancelled = 4,
  Expired = 5,
  Revoked = 6,
}

export type TLimitRecordItem = {
  tradePair: TTradePair;
  chainId: string;
  orderId: number;
  makerAddress: string;
  symbolIn: string;
  symbolOut: string;
  transactionHash: string;
  amountIn: string;
  amountOut: string;
  amountInFilled: string;
  amountOutFilled: string;
  amountInUSD: string;
  amountOutUSD: string;
  amountInFilledUSD: string;
  amountOutFilledUSD: string;
  deadline: number;
  commitTime: number;
  fillTime: number;
  cancelTime: number;
  removeTime: number;
  lastUpdateTime: number;
  limitOrderStatus: LimitOrderStatusEnum;
  totalFee: string;
  networkFee: string;
};

export type TLimitDetailItem = {
  amountInFilled: string;
  amountInFilledUSD: string;
  amountOutFilled: string;
  amountOutFilledUSD: string;
  networkFee: string;
  status: LimitOrderStatusEnum;
  takerAddress: null | string;
  totalFee: string;
  transactionHash: string;
  transactionTime: number;
};
