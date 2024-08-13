import { LIMIT_ORDER_REMAINING_UNFILLED_QUERY, PAIR_SYNC_RECORDS_QUERY } from '../queries';
import { TGetLimitOrderRemainingUnfilled, TGetPairSyncRecords } from '../types';

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
