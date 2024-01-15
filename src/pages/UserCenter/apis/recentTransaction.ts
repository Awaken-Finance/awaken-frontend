import { request } from 'api';
import { RecentTransaction, GetRecentTransactionParams, LiquidityRecord, LiquidityRecordParams } from '../type';
import { message } from 'antd';
import i18n from 'i18next';

interface TransactionListResult<T> {
  totalCount?: number;
  items?: T[];
  error?: any;
}

export async function getTransationList(params: GetRecentTransactionParams) {
  if (!params.address || !params.chainId) {
    return {
      totalCount: 0,
      items: [],
    };
  }

  const res: {
    data: TransactionListResult<RecentTransaction>;
    error: any;
    code?: number;
  } = await request.userCenter.GET_RECENT_TRANSACTION_LIST({
    params,
  });

  if (!res || res.error) {
    message.error(res.error || i18n.t('GET_RECENT_TRANSACTION_LIST_ERROR'));
    return {
      totalCount: 0,
      items: [],
    };
  }

  return res.data;
}

export async function getLiquidityRecord(params: LiquidityRecordParams) {
  if (!params.address || !params.chainId) {
    return {
      totalCount: 0,
      items: [],
    };
  }

  const res: {
    data: TransactionListResult<LiquidityRecord>;
    error: any;
    code?: number;
  } = await request.userCenter.GET_USER_LIQUIDITY_RECORDS({
    params,
  });

  if (!res || res.error) {
    message.error(res.error || i18n.t('GET_USER_LIQUIDITY_RECORDS_ERROR'));
    return {
      totalCount: 0,
      items: [],
    };
  }

  return res.data;
}
