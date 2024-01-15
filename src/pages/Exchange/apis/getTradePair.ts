import { request } from 'api';
import { PairItem } from 'types';
import { Response } from 'types/response';

export async function getPairById(params: { id?: string; address?: string }): Promise<PairItem | null> {
  const response: Response<PairItem> = await request.GET_TRADE_PAIRS_LIST({
    query: params.id,
    errMessage: 'fund-pool-info',
    params: {
      address: params?.address,
    },
  });

  if (!response || !response.data) {
    return null;
  }

  return response.data;
}
