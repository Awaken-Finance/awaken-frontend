import { getLimitOrderRemainingUnfilled, getPairReserve, getPairSyncRecords } from '../request';
import { getGraphQLClient } from '../client';
import { useCallback, useMemo } from 'react';
import { TGraphQLParamsType } from '../types';

const { REACT_APP_API_ENV } = process.env;
const AWAKEN_GRAPHQL_URL_MAP: Record<string, string> = {
  preview: 'https://app-testnet.aefinder.io/awaken/3c6b3e6724ab4fbbb7315f4dae550061/graphql',
  test: 'https://app-testnet.aefinder.io/awaken/3c6b3e6724ab4fbbb7315f4dae550061/graphql',
  mainNet: 'https://dapp.awaken.finance/AElfIndexer_Swap/SwapIndexerSchema/graphql',
};

const AWAKEN_GRAPHQL_URL = AWAKEN_GRAPHQL_URL_MAP[REACT_APP_API_ENV || ''] || AWAKEN_GRAPHQL_URL_MAP.mainNet;

export const useGraphQLClient = () => {
  return useMemo(() => getGraphQLClient(AWAKEN_GRAPHQL_URL), []);
};

export const useGetPairSyncRecords = () => {
  const client = useGraphQLClient();
  return useCallback(
    (params: TGraphQLParamsType<typeof getPairSyncRecords>) => getPairSyncRecords(client, params),
    [client],
  );
};

export const useGetLimitOrderRemainingUnfilled = () => {
  const client = useGraphQLClient();
  return useCallback(
    (params: TGraphQLParamsType<typeof getLimitOrderRemainingUnfilled>) =>
      getLimitOrderRemainingUnfilled(client, params),
    [client],
  );
};

export const useGetPairReserve = () => {
  const client = useGraphQLClient();
  return useCallback((params: TGraphQLParamsType<typeof getPairReserve>) => getPairReserve(client, params), [client]);
};
