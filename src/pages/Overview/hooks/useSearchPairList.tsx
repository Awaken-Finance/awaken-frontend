import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FetchParam } from 'types/requeset';
import { PairItem } from 'types';
import { GetPairListParams } from '../apis/getPairList';

import usePairList from './usePairList';
import Signalr from 'socket/signalr';
import { SortOrder } from 'antd/lib/table/interface';
import { isNightElfApp, isPortkeyAppWithDiscover } from 'utils/isApp';
import { useWebLogin, useWebLoginEvent, WebLoginEvents } from 'aelf-web-login';

import { useUpdateEffect } from 'ahooks';
import { useUser } from 'contexts/useUser';

interface PageInfoParams {
  pageNum?: number;
  pageSize?: number;
  field?: string | null;
  order?: SortOrder | undefined | null;
  searchVal?: string;
  poolType?: string;
}

export default function useSearchPairList(
  customParams: GetPairListParams,
  config: {
    socket?: Signalr | null;
    customPageSize?: number;
    scrollLoad?: boolean;
  },
) {
  const [dataSource, setDataSource] = useState<PairItem[]>();
  const [loading, setLoading] = useState<boolean>(true);
  const clearDataSource = useRef<boolean>(false);

  const [{ favChangeItem }] = useUser();

  const { walletType } = useWebLogin();

  const pageInfo = useRef<PageInfoParams>({
    pageNum: 1,
    pageSize: config?.customPageSize,
    searchVal: '',
    poolType: '',
    field: null,
    order: null,
  });

  const [{ list, total }, { getList = () => null }] = usePairList();

  const getListBySearch = useCallback(
    (info: PageInfoParams) => {
      const params: GetPairListParams = {
        skipCount: ((info.pageNum as number) - 1) * (info.pageSize as number),
        sorting: info.order ? `${info.field} ${info.order}` : null,
        maxResultCount: info.pageSize,
        searchTokenSymbol: info.searchVal,
        ...customParams,
      };

      if (['fav', 'other'].includes(info.poolType as string)) {
        params.tradePairFeature = ['fav', 'other'].findIndex((i: string) => i === info.poolType) + 1;
      } else {
        params.tokenSymbol = info.poolType;
      }

      getList(params);
    },
    [getList, customParams],
  );

  const getData = useCallback(
    (params: FetchParam) => {
      const { page, pageSize = config?.customPageSize, order, field, searchVal, poolType } = params;

      setLoading(true);

      // symbol change
      if (poolType && poolType !== pageInfo.current.poolType) {
        pageInfo.current = {
          ...pageInfo.current,
          pageNum: 1,
          pageSize,
          field: null,
          order: null,
          // searchVal: '',
          poolType,
        };
        clearDataSource.current = true;
        return getListBySearch(pageInfo.current);
      }

      // search change
      if (searchVal !== undefined && searchVal !== pageInfo.current.searchVal) {
        pageInfo.current = {
          ...pageInfo.current,
          pageNum: 1,
          field: null,
          order: null,
          searchVal,
        };

        clearDataSource.current = true;
        return getListBySearch(pageInfo.current);
      }

      // table size  change
      // if (pageInfo.current.pageSize !== pageSize) {
      //   pageInfo.current = {
      //     ...pageInfo.current,
      //     pageNum: 1,
      //     field: null,
      //     order: null,
      //     pageSize,
      //   };

      //   clearDataSource.current = true;
      //   return getListBySearch(pageInfo.current);
      // }

      // table fileds change
      if (order !== pageInfo.current.order || field !== pageInfo.current.field) {
        pageInfo.current = {
          ...pageInfo.current,
          order: typeof order === 'undefined' ? null : order,
          field: typeof field === 'undefined' ? null : field,
          pageNum: 1,
        };

        return getListBySearch(pageInfo.current);
      }

      pageInfo.current.pageNum = page;
      clearDataSource.current = false;
      getListBySearch(pageInfo.current);
    },
    [config?.customPageSize, getListBySearch],
  );

  const updateItem = useCallback(
    (item: PairItem) => {
      if (!dataSource?.find((i: PairItem) => i.id === item.id)) {
        return;
      }

      const list = dataSource.map((i: PairItem) => {
        if (i.id === item.id) {
          return { ...item, isFav: i.isFav, favId: i.favId };
        }
        return i;
      });

      setDataSource(list);
    },
    [dataSource],
  );

  useUpdateEffect(() => {
    if (pageInfo.current.poolType === 'fav') {
      setTimeout(() => {
        getListBySearch(pageInfo.current);
      }, 200);
    }

    const { id, isFav, favId } = favChangeItem;
    const item = dataSource?.find((item) => item.id === id);

    if (!item) {
      return;
    }

    const list = dataSource?.map((i: PairItem) => {
      if (i.id === item.id) {
        return { ...item, isFav: !!isFav, favId };
      }
      return i;
    });

    setDataSource(list);
  }, [favChangeItem]);

  useEffect(() => {
    if (config?.scrollLoad && !clearDataSource.current) {
      setDataSource((oldList = []) => {
        return [...(oldList ?? []), ...(list ?? [])].reduce((preList: PairItem[], cur: PairItem) => {
          if (preList.some((item) => item.id === cur.id)) {
            return preList;
          }

          return [...preList, cur];
        }, []);
      });
    } else {
      setDataSource(list);
    }

    setLoading(false);
  }, [config?.scrollLoad, list]);

  useEffect(() => {
    config?.socket?.on('ReceiveTradePair', updateItem);
    return () => {
      config?.socket?.off('ReceiveTradePair', updateItem);
    };
  }, [config?.socket, updateItem]);

  useWebLoginEvent(WebLoginEvents.LOGINED, () => {
    if (isPortkeyAppWithDiscover() || isNightElfApp() || walletType === 'portkey') {
      pageInfo.current = {
        ...pageInfo.current,
        pageNum: 1,
        pageSize: config?.customPageSize,
        field: null,
        order: null,
        searchVal: '',
      };
      clearDataSource.current = true;
      return getListBySearch(pageInfo.current);
    }
  });

  return useMemo(() => {
    return [
      {
        dataSource,
        loading,
        total,
        pageInfo: pageInfo.current,
      },
      {
        getData,
      },
    ];
  }, [dataSource, loading, total, pageInfo, getData]);
}
