import CommonList from 'components/CommonList';
import { useCallback } from 'react';
import { TLimitDetailItem, TLimitRecordItem } from 'types/transactions';
import LimitDetailItem from '../LimitDetailItem';
import './styles.less';

export type TLimitDetailMobileListProps = {
  dataSource?: TLimitDetailItem[];
  total?: number;
  loading?: boolean;
  getData?: (args: any) => void;
  pageNum?: number;
  pageSize?: number;
  record?: TLimitRecordItem;
};

export const LimitDetailMobileList = ({
  dataSource = [],
  pageNum,
  pageSize,
  total,
  loading,
  getData = () => null,
  record,
}: TLimitDetailMobileListProps) => {
  const fetchList = useCallback(() => {
    getData({
      page: (pageNum ?? 1) + 1,
      pageSize,
    });
  }, [getData, pageSize, pageNum]);

  const renderItem = (item: TLimitDetailItem) => {
    return <LimitDetailItem item={item} key={item?.transactionHash} record={record} />;
  };

  return (
    <div>
      <CommonList
        className="limit-detail-mobile-list-wrapper"
        dataSource={dataSource}
        renderItem={renderItem}
        total={total}
        loading={loading}
        getMore={fetchList}
        pageNum={pageNum}
        useWindow={false}
      />
    </div>
  );
};
