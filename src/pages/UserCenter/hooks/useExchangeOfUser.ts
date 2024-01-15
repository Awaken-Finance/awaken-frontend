import { message } from 'antd';
import { request } from 'api';
import { USER_CENTER_API_LIST } from 'api/list';
import { AssetBaseHeader, MyTradePair } from '../type';
import { defaultAssetValue, useAssetModuleSummary } from './useAssetSummary';

export interface ExchangeListFetchParams {
  chainId: string | null | undefined;
  address?: string | null | undefined;
  sorting?: string | null;
  skipCount?: number;
  maxResultCount?: number;
}

export interface ExchangeListResults<T> {
  totalCount?: number;
  items?: T[];
  error?: any;
}

export const getExchangeList = async (params: ExchangeListFetchParams): Promise<ExchangeListResults<MyTradePair>> => {
  if (!params.address || !params.chainId) {
    return {
      totalCount: 0,
      items: [],
    };
  }

  const res: {
    data: ExchangeListResults<MyTradePair>;
    error: any;
    code?: number;
  } = await request.userCenter.GET_USER_LIQUIDITYl({
    params,
  });

  if (!res || res.error) {
    message.error(res.error || 'error: GET_USER_LIQUIDITYl');
    return {
      totalCount: 0,
      items: [],
    };
  }

  return res.data;
};

export const useExchangeAsset = (refresh?: number) => {
  const data = useAssetModuleSummary<AssetBaseHeader>(
    {
      url: USER_CENTER_API_LIST.GET_USER_ASSET_EXCHANGE,
      errMessage: 'AssetExchange',
    },
    defaultAssetValue,
    refresh ?? 0,
  );
  return data;
};
