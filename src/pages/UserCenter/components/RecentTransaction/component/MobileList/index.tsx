import { useCallback, useState } from 'react';
import { Row, Col } from 'antd';
import { RecentTransaction, LiquidityRecord } from 'pages/UserCenter/type';
import CommonMenu from 'components/CommonMenu';
import { IconFilter } from 'assets/icons';
import Filter from '../FilterSid';
import TransactionItem from './TransactionItem';
import LiquidityRecordItem from './LiquidityRecordItem';
import CommonList from 'components/CommonList';
import { SortOrder } from 'antd/lib/table/interface';

import './index.less';
import useOutSideClick from 'hooks/useOutSIdeClick';

export default function MobileList({
  dataSource = [],
  total,
  loading,
  getData = () => null,
  pageNum,
  pageSize,
  field,
  order,
  menuChange,
  menu,
  menuList,
  side,
}: {
  dataSource?: RecentTransaction[] | LiquidityRecord[] | undefined;
  total?: number;
  loading?: boolean;
  getData?: (args: any) => void;
  pageNum?: number;
  pageSize?: number;
  field?: string | null;
  order?: SortOrder | undefined | null;
  side: number;
  menuChange: (val: string | number) => void;
  menu?: string | number;
  menuList: any[];
}) {
  const [sidVisible, setSidVisible] = useState(false);

  const ref = useOutSideClick(
    useCallback(() => {
      setSidVisible(false);
    }, []),
  );

  const sidChange = (val: number) => {
    setSidVisible(false);
    getData({
      page: pageNum,
      pageSize,
      field,
      order,
      filter: {
        side: [val],
      },
    });
  };

  const fetchList = useCallback(
    () =>
      getData({
        page: (pageNum ?? 1) + 1,
        pageSize,
        field,
        order,
        filter: {
          side: [side],
        },
      }),
    [getData, field, order, pageSize, pageNum, side],
  );

  const renderItem = (item: LiquidityRecord | RecentTransaction) => {
    if (menu === 'all') {
      return <TransactionItem item={item} key={item?.transactionHash} />;
    }

    return <LiquidityRecordItem item={item} key={item?.transactionHash} />;
  };

  return (
    <div className="transaction-list">
      <Row align="middle" justify="space-between" className="transaction-list-header">
        <Col>
          <CommonMenu menus={menuList} onChange={menuChange} value={menu} className="transaction-list-menu" />
        </Col>
        <Col>
          {menu === 'all' && (
            <div className="transaction-list-filter">
              <IconFilter onClick={() => setSidVisible(true)} />
              {sidVisible && (
                <div ref={ref} className="transaction-list-filter-box">
                  <Filter val={side} onChange={sidChange} />
                </div>
              )}
            </div>
          )}
        </Col>
      </Row>
      <div className="transaction-list-box">
        <CommonList
          dataSource={dataSource}
          renderItem={renderItem}
          total={total}
          loading={loading}
          getMore={fetchList}
          pageNum={pageNum}
        />
      </div>
    </div>
  );
}
