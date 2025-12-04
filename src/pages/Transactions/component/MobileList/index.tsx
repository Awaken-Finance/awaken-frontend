import { useCallback, useMemo, useRef, useState } from 'react';
import { Menu } from 'antd';
import TransactionItem from './TransactionItem';
import LiquidityRecordItem from './LiquidityRecordItem';
import CommonList from 'components/CommonList';
import { SortOrder } from 'antd/lib/table/interface';
import './index.less';
import { useTranslation } from 'react-i18next';
import CommonButton from 'components/CommonButton';
import { IconArrowLeft } from 'assets/icons';
import Font from 'components/Font';
import { useHistory } from 'react-router-dom';
import { TranslationMenuEnum } from 'pages/Transactions/hooks/useGetList';
import LimitRecordItem from './LimitRecordItem';
import { LimitOrderStatusEnum, LiquidityRecord, RecentTransaction, TLimitRecordItem } from 'types/transactions';
import { LimitCancelModal, LimitCancelModalInterface } from 'Modals/LimitCancelModal';
import { LimitDetailModal, LimitDetailModalInterface } from 'Modals/LimitDetailModal';

export default function MobileList({
  dataSource: _dataSource = [],
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
  dataSource?: RecentTransaction[] | LiquidityRecord[] | TLimitRecordItem[] | undefined;
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
  const { t } = useTranslation();
  const limitCancelModalRef = useRef<LimitCancelModalInterface>();
  const limitDetailModalRef = useRef<LimitDetailModalInterface>();

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

  const renderItem = useCallback(
    (item: LiquidityRecord | RecentTransaction | TLimitRecordItem) => {
      if (menu === TranslationMenuEnum.trade) {
        return <TransactionItem item={item as RecentTransaction} key={item?.transactionHash} />;
      }

      if (menu === TranslationMenuEnum.limit) {
        return (
          <LimitRecordItem
            limitCancelModalRef={limitCancelModalRef}
            limitDetailModalRef={limitDetailModalRef}
            item={item as TLimitRecordItem}
            key={item?.transactionHash}
          />
        );
      }

      return <LiquidityRecordItem item={item} key={item?.transactionHash} />;
    },
    [menu],
  );

  const history = useHistory();
  const onBack = useCallback(() => {
    history.goBack();
  }, [history]);

  const [limitCanceledMap, setLimitCanceledMap] = useState<Record<string, boolean>>({});
  const onLimitCanceled = useCallback((orderId: number) => {
    setLimitCanceledMap((pre) => ({
      ...pre,
      [orderId]: true,
    }));
  }, []);
  const dataSource = useMemo(() => {
    return _dataSource.map((item) => {
      const orderId = (item as TLimitRecordItem).orderId;
      if (orderId === undefined || !limitCanceledMap[orderId]) return item;
      return { ...item, limitOrderStatus: LimitOrderStatusEnum.Cancelled };
    });
  }, [_dataSource, limitCanceledMap]);

  return (
    <div className="transaction-list">
      <div className="transaction-mobile-header">
        <CommonButton
          className="transaction-mobile-header-back"
          type="text"
          icon={<IconArrowLeft />}
          onClick={onBack}
        />

        <Font size={16} lineHeight={24} weight="medium">
          {t('recentTransaction')}
        </Font>
      </div>

      <Menu
        mode="horizontal"
        selectedKeys={[String(menu)]}
        className="transaction-mobile-menu-headers"
        overflowedIndicator={<></>}>
        {menuList.map((item) => (
          <Menu.Item
            key={item.key}
            onClick={() => {
              menuChange(item.key);
            }}>
            {t(item.name)}
          </Menu.Item>
        ))}
      </Menu>

      <div className="transaction-list-box">
        <CommonList
          className="transaction-list-wrapper"
          dataSource={dataSource}
          renderItem={renderItem}
          total={total}
          loading={loading}
          getMore={fetchList}
          pageNum={pageNum}
        />
      </div>

      <LimitCancelModal ref={limitCancelModalRef} onSuccess={onLimitCanceled} />

      <LimitDetailModal ref={limitDetailModalRef} />
    </div>
  );
}
