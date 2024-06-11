import { getPairSyncRecords } from '../request';
import { getGraphQLClient } from '../client';
import { useCallback } from 'react';
import { TGraphQLParamsType } from '../types';

export const useGraphQLClient = () => {
  return getGraphQLClient('/AElfIndexer_Swap/SwapIndexerSchema/graphql');
};

export const useGetPairSyncRecords = () => {
  const client = useGraphQLClient();
  return useCallback(
    (params: TGraphQLParamsType<typeof getPairSyncRecords>) => getPairSyncRecords(client, params),
    [client],
  );
};
