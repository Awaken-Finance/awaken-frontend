import { useCallback, useMemo } from 'react';
import CommonTableList, { CommonTableListProps } from './CommonTableList';
import InfiniteScroll from 'react-infinite-scroller';
import clsx from 'clsx';
import { Spin } from 'antd';
import Font from 'components/Font';
import { FetchParam } from 'types/requeset';
import { useTranslation } from 'react-i18next';

export interface ScrollTableList<RecordType> extends CommonTableListProps<RecordType> {
  useWindow?: boolean;
  tableClassName?: string;
  nothingMoreMsg?: string;
  hideNoMoreOnSinglePage?: boolean;
}

export default function ScrollTableList<RecordType>({
  dataSource = [],
  total = 0,
  loading = true,
  pageSize,
  pageNum,

  field,
  order,
  onChange = () => null,
  tableClassName = '',

  useWindow = true,
  className,
  nothingMoreMsg = 'NothingMore',
  hideNoMoreOnSinglePage = true,
  ...props
}: ScrollTableList<RecordType>) {
  const { t } = useTranslation();

  const hasMore = useMemo(() => {
    if (!total) {
      return false;
    }
    return total > dataSource.length;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSource.length]);

  const getMore = useCallback(() => {
    onChange({
      field,
      order,
      page: (pageNum ?? 1) + 1,
      pageSize,
    });
  }, [field, onChange, order, pageNum, pageSize]);

  const handleTableChange = (params: FetchParam) => {
    onChange({
      ...params,
      page: 1,
      pageSize,
    });
  };

  const nothingMore = useMemo(() => {
    if (hasMore || !dataSource.length || (hideNoMoreOnSinglePage && pageNum === 1)) {
      return null;
    }
    return (
      <div className="nothing-box" key="no-more">
        <Font lineHeight={18} color="three" size={12}>
          {t(nothingMoreMsg)}
        </Font>
      </div>
    );
  }, [hasMore, dataSource, hideNoMoreOnSinglePage, pageNum, t, nothingMoreMsg]);

  return (
    <InfiniteScroll
      useWindow={useWindow}
      className={clsx('common-list', className)}
      loadMore={() => {
        if (loading) {
          return;
        }
        getMore();
      }}
      hasMore={hasMore}
      loader={
        <div className="loading-box">
          <Spin />
        </div>
      }>
      <CommonTableList
        {...props}
        dataSource={dataSource}
        total={total}
        pageSize={total}
        pageNum={1}
        onChange={handleTableChange}
        className={tableClassName}
        loading={pageNum === 1 ? loading : false}
      />
      {nothingMore}
    </InfiniteScroll>
  );
}
