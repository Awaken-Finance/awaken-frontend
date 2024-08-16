import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useMobile } from 'utils/isMobile';
import { FetchParam } from 'types/requeset';
import { useDebounceFn } from 'ahooks';
import PcTable from './component/PcTable';
import MobileList from './component/MobileList';
import useGetList, { PageInfoParams, TranslationMenuEnum } from './hooks/useGetList';
import { useTranslation } from 'react-i18next';
import { LiquidityRecord, RecentTransaction } from 'pages/UserCenter/type';
import { useActiveWeb3React } from 'hooks/web3';
import { TLimitRecordItem } from 'types/transactions';
import { useRouteMatch } from 'react-router-dom';

export default function Transactions() {
  const isMobile = useMobile();

  const preDataSource = useRef<LiquidityRecord[] | RecentTransaction[]>([]);
  const clearDataSource = useRef<boolean>(false);

  const match = useRouteMatch<{ menu: string }>('/transactions/:menu');
  const { menu: routeMenu } = match?.params || {};
  const [menu, setMenu] = useState<TranslationMenuEnum>(
    TranslationMenuEnum[routeMenu as keyof typeof TranslationMenuEnum] ?? TranslationMenuEnum.trade,
  );

  const [searchVal, setSearchVal] = useState('');

  const [{ total, list, loading: _loading }, { getList = () => null }] = useGetList();
  const [isInit, setIsInit] = useState(false);
  const loading = useMemo(() => !isInit || _loading, [_loading, isInit]);

  const { t } = useTranslation();

  const menuList = [
    {
      name: t('RecentTransactionTrade'),
      key: TranslationMenuEnum.trade,
    },
    {
      name: t('Limits'),
      key: TranslationMenuEnum.limit,
    },
    {
      name: t('RecentTransactionAdd'),
      key: TranslationMenuEnum.add,
    },
    {
      name: t('RecentTransactionRemove'),
      key: TranslationMenuEnum.remove,
    },
  ];

  const pageInfo = useRef<PageInfoParams>({
    pageNum: 1,
    pageSize: 20,
    side: -1,
    field: null,
    order: null,
  });

  const { run: searchDebounce } = useDebounceFn(
    () => {
      pageInfo.current = {
        pageNum: 1,
        pageSize: 20,
        side: -1,
        field: null,
        order: null,
      };

      getList(pageInfo.current, searchVal, menu);
    },
    { wait: 300 },
  );

  const searchChange = useCallback(
    (val: string) => {
      searchDebounce();
      setSearchVal(val);
    },
    [searchDebounce],
  );

  const menuChange = useCallback(
    (val: string | number) => {
      pageInfo.current = {
        pageNum: 1,
        pageSize: 20,
        side: -1,
        field: null,
        order: null,
      };

      preDataSource.current = [];
      clearDataSource.current = true;
      getList(pageInfo.current, '', val);
      setSearchVal('');
      setMenu(val as TranslationMenuEnum);
    },
    [getList],
  );

  const getData = (params: FetchParam): void => {
    const { page, pageSize, order, field, filter } = params;

    // page size change
    if (pageSize !== undefined && pageInfo.current.pageSize !== pageSize) {
      pageInfo.current = {
        pageNum: 1,
        pageSize: pageSize,
        side: -1,
        field: null,
        order: null,
      };
      clearDataSource.current = true;
      return getList(pageInfo.current, searchVal, menu);
    }

    // filter change
    if (filter?.side && filter?.side[0] !== pageInfo.current.side) {
      pageInfo.current = {
        ...pageInfo.current,
        pageNum: 1,
        side: filter.side[0],
      };
      clearDataSource.current = true;
      return getList(pageInfo.current, searchVal, menu);
    }

    // sorter change
    if (order !== pageInfo.current.order || field !== pageInfo.current.field) {
      pageInfo.current = {
        ...pageInfo.current,
        pageNum: 1,
        order,
        field,
      };
      clearDataSource.current = true;
      return getList(pageInfo.current, searchVal, menu);
    }

    if (page !== undefined) {
      // page num change
      pageInfo.current.pageNum = page;
    }
    clearDataSource.current = false;
    getList(pageInfo.current, searchVal, menu);
  };

  const dataSource = useMemo(() => {
    if (isMobile && !clearDataSource.current) {
      preDataSource.current = [...preDataSource.current, ...(list ?? [])].reduce(
        (
          preList: LiquidityRecord[] | RecentTransaction[] | TLimitRecordItem[],
          cur: LiquidityRecord | RecentTransaction | TLimitRecordItem,
        ) => {
          if (preList.some((item) => item.transactionHash === cur.transactionHash)) {
            return preList;
          }
          return [...preList, cur];
        },
        [],
      );
    } else {
      preDataSource.current = list ?? [];
    }

    return preDataSource.current;
  }, [isMobile, list]);

  const renderContent = () => {
    if (isMobile) {
      return (
        <MobileList
          dataSource={dataSource}
          total={total}
          loading={loading}
          getData={getData}
          menuChange={menuChange}
          menu={menu}
          menuList={menuList}
          {...pageInfo.current}
        />
      );
    }
    return (
      <PcTable
        dataSource={list}
        total={total}
        loading={loading}
        getData={getData}
        menuChange={menuChange}
        searchVal={searchVal}
        searchChange={searchChange}
        menu={menu}
        menuList={menuList}
        {...pageInfo.current}
      />
    );
  };

  const { account, chainId } = useActiveWeb3React();
  const refresh = useCallback(() => {
    getList(pageInfo.current, searchVal, menu);
  }, [getList, menu, searchVal]);
  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;

  useEffect(() => {
    if (account && chainId) {
      setIsInit(true);
    }

    refreshRef.current();
  }, [account, chainId]);

  return renderContent();
}
