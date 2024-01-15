import { useActiveWeb3React } from 'hooks/web3';
import { useMemo, useRef } from 'react';
import { useMobile } from 'utils/isMobile';
import { getExchangeList, ExchangeListFetchParams } from 'pages/UserCenter/hooks/useExchangeOfUser';
import { FetchParam } from 'types/requeset';
import { useRequest, useMount } from 'ahooks';
import { SortOrder } from 'antd/lib/table/interface';

import PcTable from './components/PcTable';
import MobileList from './components/MobileList';
import { MyTradePair } from 'pages/UserCenter/type';

interface PageInfoParams {
  pageNum?: number;
  pageSize?: number;
  field?: string | null;
  order?: SortOrder | undefined | null;
}

export default function AssetExchange() {
  const { account, chainId } = useActiveWeb3React();

  const isMobile = useMobile();

  const mobileList = useRef<MyTradePair[]>([]);

  const pageInfo = useRef<PageInfoParams>({
    pageNum: 1,
    pageSize: 20,
    field: null,
    order: null,
  });

  const { data, loading, run } = useRequest((params: ExchangeListFetchParams) => getExchangeList(params));

  const getList = (info: PageInfoParams) => {
    const params: ExchangeListFetchParams = {
      address: account,
      chainId: chainId,
      skipCount: ((info.pageNum as number) - 1) * (info.pageSize as number),
      maxResultCount: info.pageSize,
      sorting: info.order ? `${info.field} ${info.order}` : null,
    };

    run(params);
  };

  const getData = (params: FetchParam): void => {
    const { page, pageSize = 20, order, field } = params;

    // page size change
    if (pageInfo.current.pageSize !== pageSize) {
      pageInfo.current = {
        pageNum: 1,
        pageSize: pageSize,
        field: null,
        order: null,
      };
      return getList(pageInfo.current);
    }

    // sorter change
    if (order !== pageInfo.current.order || field !== pageInfo.current.field) {
      pageInfo.current = {
        ...pageInfo.current,
        pageNum: 1,
        order,
        field,
      };
      return getList(pageInfo.current);
    }

    // page num change
    pageInfo.current.pageNum = page;
    getList(pageInfo.current);
  };

  const dataSource = useMemo(() => {
    if (!isMobile) {
      return data?.items;
    }

    mobileList.current = [...mobileList.current, ...(data?.items ?? [])].reduce((preList: MyTradePair[], cur) => {
      if (preList.some((item) => item.tradePair.id === cur.tradePair.id)) {
        return preList;
      }

      return [...preList, cur];
    }, []);

    return mobileList.current;
  }, [data, isMobile]);

  const renderContent = () => {
    if (isMobile) {
      return (
        <MobileList
          dataSource={dataSource}
          loading={loading}
          getData={getData}
          total={data?.totalCount}
          {...pageInfo.current}
        />
      );
    }
    return (
      <PcTable
        dataSource={data?.items}
        total={data?.totalCount}
        loading={loading}
        getData={getData}
        {...pageInfo.current}
      />
    );
  };

  useMount(() => {
    getList(pageInfo.current);
  });

  return renderContent();
}
