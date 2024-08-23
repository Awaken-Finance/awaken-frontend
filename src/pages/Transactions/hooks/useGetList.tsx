import { useRequest } from 'ahooks';
import { SortOrder } from 'antd/lib/table/interface';
import { getLimitList, getLiquidityRecord, getTransactionList } from 'api/utils/recentTransaction';
import { useActiveWeb3React } from 'hooks/web3';
import { useCallback, useMemo } from 'react';
import { GetRecentTransactionParams, LiquidityRecordParams, TLimitRecordParams } from 'types/transactions';

export interface PageInfoParams {
  pageNum?: number;
  pageSize?: number;
  side: number;
  field?: string | null;
  order?: SortOrder | undefined | null;
}

export enum TranslationMenuEnum {
  trade = 'all',
  add = 1,
  remove,
  limit = 'limit',
}

export default function useGetList() {
  const { account, chainId } = useActiveWeb3React();

  const {
    data,
    loading,
    run: getData,
  } = useRequest(
    (
      params: GetRecentTransactionParams | LiquidityRecordParams | TLimitRecordParams,
      menu: string | number,
    ): Promise<any> => {
      if (menu === TranslationMenuEnum.trade) {
        return getTransactionList(params);
      }
      if (menu === TranslationMenuEnum.limit) {
        return getLimitList(params);
      }

      return getLiquidityRecord(params);
    },
    { manual: true },
  );

  const getList = useCallback(
    (info: PageInfoParams, searchVal: string, menu: string | number) => {
      const isTransactionId = searchVal.length === 64;
      const params: GetRecentTransactionParams | LiquidityRecordParams | TLimitRecordParams = {
        address: account,
        chainId: chainId,
        skipCount: ((info.pageNum as number) - 1) * (info.pageSize as number),
        maxResultCount: info.pageSize,
        sorting: info.order ? `${info.field} ${info.order}` : null,
        tokenSymbol: isTransactionId ? undefined : searchVal,
        transactionHash: isTransactionId ? searchVal : undefined,
      };

      if (menu === TranslationMenuEnum.trade) {
        params.side = info.side === -1 ? null : info.side;
      }
      if (menu === TranslationMenuEnum.limit) {
        // (params as TLimitRecordParams).limitOrderStatus = 0;
        (params as TLimitRecordParams).makerAddress = account;
        (params as TLimitRecordParams).tokenSymbol = searchVal;
      } else {
        params.type = menu;
      }

      getData(params, menu);
    },
    [chainId, getData, account],
  );

  return useMemo(() => {
    return [{ list: data?.items, total: data?.totalCount, loading }, { getList }];
  }, [data?.items, data?.totalCount, getList, loading]);
}
