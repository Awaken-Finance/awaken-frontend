import { useCallback, useMemo, useRef, useState } from 'react';
import { useMobile } from 'utils/isMobile';
import { FetchParam } from 'types/requeset';
import { useMount, useDebounceFn } from 'ahooks';
import { LiquidityRecord, RecentTransaction } from '../../type';
import PcTable from './component/PcTable';
import MobileList from './component/MobileList';
import useGetList, { PageInfoParams } from './hooks/useGetList';
import { useTranslation } from 'react-i18next';

export default function Transaction() {
  const isMobile = useMobile();

  const preDataSource = useRef<LiquidityRecord[] | RecentTransaction[]>([]);
  const clearDataSource = useRef<boolean>(false);

  const [menu, setMenu] = useState<string | number>('all');

  const [searchVal, setSearchVal] = useState('');

  const [{ total, list, loading }, { getList = () => null }] = useGetList();

  const { t } = useTranslation();

  const menuList = [
    {
      name: t('RecentTransactionTrade'),
      key: 'all',
    },
    {
      name: t('RecentTransactionAdd'),
      key: 0,
    },
    {
      name: t('RecentTransactionRemove'),
      key: 1,
    },
  ];

  const pageInfo = useRef<PageInfoParams>({
    pageNum: 1,
    pageSize: 20,
    side: -1,
    field: null,
    order: null,
  });

  const { run: searchDebunce } = useDebounceFn(
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
      searchDebunce();
      setSearchVal(val);
    },
    [searchDebunce],
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
      setMenu(val);
    },
    [getList],
  );

  const getData = (params: FetchParam): void => {
    const { page, pageSize, order, field, filter } = params;

    // page size change
    if (pageInfo.current.pageSize !== pageSize) {
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

    // page num change
    pageInfo.current.pageNum = page;
    clearDataSource.current = false;
    getList(pageInfo.current, searchVal, menu);
  };

  const dataSource = useMemo(() => {
    if (isMobile && !clearDataSource.current) {
      preDataSource.current = [...preDataSource.current, ...(list ?? [])].reduce(
        (preList: LiquidityRecord[] | RecentTransaction[], cur: LiquidityRecord | RecentTransaction) => {
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

  useMount(() => {
    getList(pageInfo.current, searchVal, menu);
  });

  return renderContent();
}
