import { request } from 'api';
import { PairItem } from 'types';
import { ListResponse } from 'types/response';
import { getIsReversed, getPairReversed } from 'utils/pair';

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

export const getTradePairsListOrigin = async (
  params: GetPairListParams,
  count = 0,
): Promise<{ items: PairItem[]; totalCount: number } | undefined> => {
  const respnse: GetPairListResults = await request.GET_TRADE_PAIRS_LIST({
    errMessage: 'GET_TRADE_PAIRS_LIST',
    params,
  });

  if (!respnse?.data.totalCount) {
    if (count > 0) {
      return {
        totalCount: 0,
        items: [],
      };
    } else {
      const token0 = params.token0Symbol;
      const token1 = params.token1Symbol;
      params.token1Symbol = token0;
      params.token0Symbol = token1;
      return await getTradePairsListOrigin(params, 1);
    }
  }
  const items = respnse?.data.items;
  items.forEach((pair, index) => {
    items[index] = getPairReversed(pair);
  });
  respnse.data.items = items;
  return respnse.data;
};

export async function getPairList(
  params: GetPairListParams,
): Promise<{ items: PairItem[]; totalCount: number } | undefined> {
  try {
    return await getTradePairsListOrigin(params);
  } catch (e) {
    console.error('e: ', e);
  }
}

export async function getPairListByIds(
  params: GetPairListParams,
): Promise<{ items: PairItem[]; totalCount: number } | undefined> {
  try {
    let token0 = params?.token0Symbol;
    let token1 = params?.token1Symbol;

    const isReversed = getIsReversed(token0 || '', token1 || '');
    if (isReversed) {
      token0 = params?.token1Symbol;
      token1 = params?.token0Symbol;
    }
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

    const items = respnse?.data.items;
    items.forEach((pair, index) => {
      items[index] = getPairReversed(pair);
    });
    respnse.data.items = items;

    return respnse.data;
  } catch (e) {
    console.error('e: ', e);
  }
}
