import { ApolloQueryResult } from '@apollo/client';
import { TGraphQLClient } from './common';
export * from './common';

export type TCommonGraphQLResult<T> = Promise<ApolloQueryResult<T>>;

export type TGetPairSyncRecordsParams = {
  dto: {
    chainId: string;
    pairAddresses: string[];
  };
};
export type TGetPairSyncRecordsResult = {
  pairSyncRecords: any[];
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
