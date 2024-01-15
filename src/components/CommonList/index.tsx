import { List, ListProps, Spin } from 'antd';
import { useMemo } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import Font from 'components/Font';
import clsx from 'clsx';
import CommonEmpty from 'components/CommonEmpty';
import { useMobile } from 'utils/isMobile';
import { useTranslation } from 'react-i18next';

import './index.less';

export interface CommonListProps<T> {
  useWindow?: boolean;

  dataSource: T[];
  renderItem: ListProps<T>['renderItem'];
  getMore?: () => void;
  className?: string;
  loading?: boolean;
  itemLayout?: ListProps<T>['itemLayout'];
  total?: number;
  nothingMoreMsg?: string;
  hideNoMoreOnSinglePage?: boolean;
  pageNum?: number;
}
export default function CommonList<T>({
  useWindow = true,

  dataSource,
  total = 0,
  loading = true,
  itemLayout,
  className,
  renderItem,
  getMore = () => null,
  nothingMoreMsg = 'NothingMore',
  hideNoMoreOnSinglePage = true,
  pageNum,
}: CommonListProps<T>) {
  const { t } = useTranslation();

  const isMobile = useMobile();

  const hasMore = useMemo(() => {
    if (!total) {
      return false;
    }

    return total > dataSource.length;
  }, [dataSource.length, total]);

  const nothingMore = useMemo(() => {
    if (hasMore || !dataSource.length || (hideNoMoreOnSinglePage && pageNum === 1)) {
      return null;
    }
    return (
      <div className="nothing-box">
        <Font lineHeight={18} color="three" size={12}>
          {t(nothingMoreMsg)}
        </Font>
      </div>
    );
  }, [hasMore, dataSource.length, hideNoMoreOnSinglePage, pageNum, t, nothingMoreMsg]);

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
      <List
        locale={{
          emptyText: !loading && <CommonEmpty type="nodata" size={isMobile ? 'small' : 'large'} />,
        }}
        itemLayout={itemLayout}
        dataSource={dataSource}
        renderItem={renderItem}
        className={loading ? 'list-items' : ''}
        loading={pageNum === 1 ? loading : false}
      />

      {nothingMore}
    </InfiniteScroll>
  );
}
