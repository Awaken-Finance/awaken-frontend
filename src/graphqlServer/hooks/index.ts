import {
  getActivityDetail,
  getActivityDetailList,
  getActivityList,
  getLimitOrderRemainingUnfilled,
  getPairReserve,
  getPairSyncRecords,
} from '../request';
import { getGraphQLClient } from '../client';
import { useCallback, useMemo } from 'react';
import { TGraphQLParamsType } from '../types';

const { REACT_APP_API_ENV } = process.env;
const AWAKEN_GRAPHQL_URL_MAP: Record<string, string> = {
  preview: 'https://test-indexer-api.aefinder.io/api/app/graphql/awaken',
  test: 'https://test-indexer-api.aefinder.io/api/app/graphql/awaken',
  mainnet: 'https://indexer-api.aefinder.io/api/app/graphql/awaken',
};

const CMS_GRAPHQL_URL_MAP: Record<string, string> = {
  preview: 'https://test-cms-v2.awaken.finance/graphql',
  test: 'https://test-cms-v2.awaken.finance/graphql',
  mainnet: 'https://cms-v2.awaken.finance/graphql',
};

const AWAKEN_GRAPHQL_URL = AWAKEN_GRAPHQL_URL_MAP[REACT_APP_API_ENV || 'mainnet'] || AWAKEN_GRAPHQL_URL_MAP.mainnet;

const CMS_GRAPHQL_URL = CMS_GRAPHQL_URL_MAP[REACT_APP_API_ENV || 'mainnet'] || CMS_GRAPHQL_URL_MAP.mainnet;

export const useGraphQLClient = () => {
  return useMemo(() => getGraphQLClient(AWAKEN_GRAPHQL_URL), []);
};

export const useCMSGraphQLClient = () => {
  return useMemo(() => getGraphQLClient(CMS_GRAPHQL_URL), []);
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

export const useGetActivityDetail = () => {
  const client = useCMSGraphQLClient();
  return useCallback(
    (params: TGraphQLParamsType<typeof getActivityDetail>) => getActivityDetail(client, params),
    [client],
  );
};

export const useGetActivityList = () => {
  const client = useCMSGraphQLClient();
  return useCallback((params: TGraphQLParamsType<typeof getActivityList>) => getActivityList(client, params), [client]);
};

export const useGetActivityDetailList = () => {
  const client = useCMSGraphQLClient();
  return useCallback(
    (params: TGraphQLParamsType<typeof getActivityDetailList>) => getActivityDetailList(client, params),
    [client],
  );
};
