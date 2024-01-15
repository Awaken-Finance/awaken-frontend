import { useRequest } from 'ahooks';
import { SortOrder } from 'antd/lib/table/interface';
import { useActiveWeb3React } from 'hooks/web3';
import { getLiquidityRecord, getTransationList } from 'pages/UserCenter/apis/recentTransaction';
import { GetRecentTransactionParams, LiquidityRecordParams } from 'pages/UserCenter/type';
import { useCallback, useMemo } from 'react';

export interface PageInfoParams {
  pageNum?: number;
  pageSize?: number;
  side: number;
  field?: string | null;
  order?: SortOrder | undefined | null;
}

export default function useGetList() {
  const { account, chainId } = useActiveWeb3React();

  const {
    data,
    loading,
    run: getData,
  } = useRequest(
    (params: GetRecentTransactionParams | LiquidityRecordParams, menu: string | number) => {
      if (menu === 'all') {
        return getTransationList(params);
      }

      return getLiquidityRecord(params);
    },
    { manual: true },
  );

  const getList = useCallback(
    (info: PageInfoParams, searchVal: string, menu: string | number) => {
      const isTransactionId = searchVal.length === 64;
      const params: GetRecentTransactionParams | LiquidityRecordParams = {
        address: account,
        chainId: chainId,
        skipCount: ((info.pageNum as number) - 1) * (info.pageSize as number),
        maxResultCount: info.pageSize,
        sorting: info.order ? `${info.field} ${info.order}` : null,
        tokenSymbol: isTransactionId ? undefined : searchVal,
        transactionHash: isTransactionId ? searchVal : undefined,
      };

      if (menu === 'all') {
        params.side = info.side === -1 ? null : info.side;
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
