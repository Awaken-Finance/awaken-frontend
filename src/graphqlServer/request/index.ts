import { LIMIT_ORDER_REMAINING_UNFILLED_QUERY, PAIR_RESERVE_QUERY, PAIR_SYNC_RECORDS_QUERY } from '../queries';
import { TGetLimitOrderRemainingUnfilled, TGetPairReserve, TGetPairSyncRecords } from '../types';

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
