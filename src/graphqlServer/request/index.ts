import { ACTIVITY_LIST_QUERY, ACTIVITY_QUERY } from 'graphqlServer/queries/activity';
import { LIMIT_ORDER_REMAINING_UNFILLED_QUERY, PAIR_RESERVE_QUERY, PAIR_SYNC_RECORDS_QUERY } from '../queries';
import {
  TGetActivityDetail,
  TGetActivityList,
  TGetLimitOrderRemainingUnfilled,
  TGetPairReserve,
  TGetPairSyncRecords,
} from '../types';

export const getPairSyncRecords: TGetPairSyncRecords = (client, params) => {
  return client.query({
    query: PAIR_SYNC_RECORDS_QUERY,
    variables: params,
  });
};

export const getLimitOrderRemainingUnfilled: TGetLimitOrderRemainingUnfilled = (client, params) => {
  return client.query({
    query: LIMIT_ORDER_REMAINING_UNFILLED_QUERY,
    variables: params,
  });
};

export const getPairReserve: TGetPairReserve = (client, params) => {
  return client.query({
    query: PAIR_RESERVE_QUERY,
    variables: params,
  });
};

export const getActivityDetail: TGetActivityDetail = (client, params) => {
  return client.query({
    query: ACTIVITY_QUERY,
    variables: params,
  });
};

export const getActivityList: TGetActivityList = (client, params) => {
  return client.query({
    query: ACTIVITY_LIST_QUERY,
    variables: params,
  });
};
