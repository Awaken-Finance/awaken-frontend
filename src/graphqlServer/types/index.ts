import { ApolloQueryResult } from '@apollo/client';
import { TGraphQLClient } from './common';
export * from './common';

export type TCommonGraphQLResult<T> = Promise<ApolloQueryResult<T>>;

export type TPairReserveItem = {
  pairAddress: string;
  symbolA: string;
  symbolB: string;
  reserveA: string;
  reserveB: string;
};

export type TGetPairSyncRecordsParams = {
  dto: {
    chainId: string;
    pairAddresses: string[];
  };
};
export type TGetPairSyncRecordsResult = {
  pairSyncRecords: TPairReserveItem[];
};
export type TGetPairSyncRecords = (
  client: TGraphQLClient,
  params: TGetPairSyncRecordsParams,
) => TCommonGraphQLResult<TGetPairSyncRecordsResult>;

export type TGetLimitOrderRemainingUnfilledParams = {
  dto: {
    chainId: string;
    makerAddress: string;
    tokenSymbol: string;
  };
};
export type TGetLimitOrderRemainingUnfilledResult = {
  limitOrderRemainingUnfilled: {
    value: string;
  };
};
export type TGetLimitOrderRemainingUnfilled = (
  client: TGraphQLClient,
  params: TGetLimitOrderRemainingUnfilledParams,
) => TCommonGraphQLResult<TGetLimitOrderRemainingUnfilledResult>;

export type TGetPairReserveParams = {
  dto: {
    chainId: string;
    symbolA: string;
    symbolB: string;
  };
};
export type TGetPairReserveResult = {
  pairReserve: {
    syncRecords: TPairReserveItem[];
  };
};
export type TGetPairReserve = (
  client: TGraphQLClient,
  params: TGetPairReserveParams,
) => TCommonGraphQLResult<TGetPairReserveResult>;
