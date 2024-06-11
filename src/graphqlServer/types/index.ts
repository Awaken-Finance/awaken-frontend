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
