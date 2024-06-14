import { TokenInfo } from 'types';

export type TPairRoutePath = {
  token0: TokenInfo;
  token1: TokenInfo;
  token0Amount?: string;
  token1Amount?: string;
  address: string;
  feeRate: number;
};

export type TPairRoute = {
  feeRate: number;
  path: Array<TPairRoutePath>;
  rawPath: Array<TokenInfo>;
};

export type TSwapRecordItem = {
  tokenIn: TokenInfo;
  tokenOut: TokenInfo;
  valueIn: string;
  valueOut: string;
  tokenInReserve: string;
  tokenOutReserve: string;
};

export type TSwapRouteInfo = {
  route: TPairRoute;
  valueIn: string;
  valueOut: string;
  recordList: TSwapRecordItem[];
};
