import { TokenInfo } from 'types';
import { TTradePair, TTradePairInfo } from 'types/pair';
import { TListResponseData } from 'types/response';

export type TTradePairDistributionItem = {
  name: string;
  tradePair: TTradePair;
  valueInUsd: string;
  valuePercent: string;
};

export type TTokenDistributionItem = {
  token: TokenInfo;
  valueInUsd: string;
  valuePercent: string;
};

export type TAssetPortfolio = {
  totalPositionsInUSD: string;
  totalFeeInUSD: string;
  tradePairPositionDistributions: TTradePairDistributionItem[];
  tradePairFeeDistributions: TTradePairDistributionItem[];
  tokenPositionDistributions: TTokenDistributionItem[];
  tokenFeeDistributions: TTokenDistributionItem[];
};

export type TIdleTokenItem = {
  tokenDto: TokenInfo;
  valueInUsd: string;
  percent: string;
};
export type TIdleTokenInfo = {
  totalValueInUsd: string;
  idleTokens: TIdleTokenItem[];
};

export type TLiquidityValue = {
  valueInUsd: string;
  token0Amount: string;
  token0AmountInUsd: string;
  token0Percent: string;
  token1Amount: string;
  token1AmountInUsd: string;
  token1Percent: string;
};

export type TEstimatedAPRItem = {
  type: number;
  percent: string;
};
export type TLiquidityPositionItem = {
  tradePairInfo: TTradePairInfo;
  lpTokenAmount: string;
  lpTokenPercent: string;
  position: TLiquidityValue;
  fee: TLiquidityValue;
  cumulativeAddition: TLiquidityValue;
  estimatedAPR: TEstimatedAPRItem[];
  dynamicAPR: string;
  impermanentLossInUSD: string;
};

export type TTLiquidityPositionResult = TListResponseData<TLiquidityPositionItem>;
