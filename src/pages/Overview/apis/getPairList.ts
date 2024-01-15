import { request } from 'api';
import { PairItem } from 'types';
import { ListResponse } from 'types/response';

export interface GetPairListParams {
  chainId?: string;
  address?: string;
  favList?: string[];
  searchTokenSymbol?: string;
  tokenSymbol?: string;
  ids?: string[];
  isOtherSymbol?: boolean;
  tradePairFeature?: number | '';
  sorting?: string | null;
  skipCount?: number;
  maxResultCount?: number;
  pageNum?: number;
  page?: number;

  token0Symbol?: string;
  token1Symbol?: string;
  feeRate?: number | string;
}

export type GetPairListResults = ListResponse<PairItem>;

export async function getPairList(
  params: GetPairListParams,
): Promise<{ items: PairItem[]; totalCount: number } | undefined> {
  try {
    const respnse: GetPairListResults = await request.GET_TRADE_PAIRS_LIST({
      errMessage: 'GET_TRADE_PAIRS_LIST',
      params,
    });

    if (!respnse?.data) {
      return {
        totalCount: 0,
        items: [],
      };
    }

    return respnse.data;
  } catch (e) {
    console.error('e: ', e);
  }
}

export async function getPairListByIds(
  params: GetPairListParams,
): Promise<{ items: PairItem[]; totalCount: number } | undefined> {
  try {
    const respnse: GetPairListResults = await request.GET_EXCHANGE_TRADE_PAIR_BY_SEARCH({
      method: 'POST',
      errMessage: 'getExchangeOfUserByIds',
      data: params,
    });

    if (!respnse?.data) {
      return {
        items: [],
        totalCount: 0,
      };
    }

    return respnse.data;
  } catch (e) {
    console.error('e: ', e);
  }
}
