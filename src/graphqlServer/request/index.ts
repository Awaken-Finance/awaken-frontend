import { PAIR_SYNC_RECORDS_QUERY } from '../queries';
import { TGetPairSyncRecords } from '../types';

export const getPairSyncRecords: TGetPairSyncRecords = (client, params) => {
  return client.query({
    query: PAIR_SYNC_RECORDS_QUERY,
    variables: params,
  });
};
