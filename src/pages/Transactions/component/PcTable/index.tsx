import { useCallback, useMemo, useRef, useState } from 'react';
import { Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';
import { CommonTable } from 'components/CommonTable';
import Font from 'components/Font';
import CommonMenu from 'components/CommonMenu';
import SearchTairByName from 'components/SearchTairByName';
import { FetchParam } from 'types/requeset';
import { SortOrder } from 'antd/lib/table/interface';
import './index.less';
import CommonButton from 'components/CommonButton';
import { IconArrowLeft, IconNotificationWarning } from 'assets/icons';
import { useHistory } from 'react-router-dom';
import { TranslationMenuEnum } from 'pages/Transactions/hooks/useGetList';
import { LimitOrderStatusEnum, RecentTransaction, TLimitRecordItem } from 'types/transactions';
import { LimitCancelModal, LimitCancelModalInterface } from 'Modals/LimitCancelModal';
import { useLimitColumns, useTransactionColumns } from './columns';
import { LimitDetailModal, LimitDetailModalInterface } from 'Modals/LimitDetailModal';

export default function PcTable({
  dataSource: _dataSource,
  total,
  loading,
  getData,
  menuChange,
  searchVal,
  searchChange,
  menu,
  menuList,
  pageSize,
  pageNum,
  field,
  order,
  side,
}: {
  dataSource?: RecentTransaction[];
  total?: number;
  loading?: boolean;
  getData: (args: FetchParam) => void;
  menuChange: (val: string | number) => void;
  searchVal?: string;
  searchChange?: (val: string) => void;
  menu?: string | number;
  menuList: any[];
  pageSize?: number;
  pageNum?: number;
  field?: string | null;
  order?: SortOrder;
  side: number;
}) {
  const { t } = useTranslation();
  const limitCancelModalRef = useRef<LimitCancelModalInterface>();
  const limitDetailModalRef = useRef<LimitDetailModalInterface>();

  const columns = useTransactionColumns({
    menu,
    field,
    order,
    side,
  });
  const limitColumns = useLimitColumns({
    limitCancelModalRef,
    limitDetailModalRef,
  });

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
    if (!_dataSource) return undefined;

    return _dataSource.map((item) => {
      const orderId = (item as unknown as TLimitRecordItem).orderId;
      if (orderId === undefined || !limitCanceledMap[orderId]) return item;
      return { ...item, limitOrderStatus: LimitOrderStatusEnum.Cancelled };
    });
  }, [_dataSource, limitCanceledMap]);

  return (
    <div className="recent-tx-pc-table">
      <div className="pc-table-header">
        <CommonButton className="recent-tx-back-icon-btn" type="text" icon={<IconArrowLeft />} onClick={onBack} />
        <Font weight="bold" lineHeight={32} size={24}>
          {t('recentTransaction')}
        </Font>
      </div>
      <div>
        <Row justify="space-between" align="middle" className="pc-table-operate">
          <Col>
            <CommonMenu menus={menuList} onChange={menuChange} value={menu} />
          </Col>
          <Col>
            <SearchTairByName value={searchVal} onChange={searchChange} />
          </Col>
        </Row>
      </div>

      <div className="transaction-table-box">
        {menu === TranslationMenuEnum.limit && (
          <div className="limit-list-tips">
            <IconNotificationWarning className="limit-list-tips-icon" />
            <Font size={14} lineHeight={20} color="secondary">
              {t('limitListTips')}
            </Font>
          </div>
        )}
        <CommonTable
          onChange={getData}
          total={total}
          loading={loading}
          dataSource={dataSource}
          columns={menu === TranslationMenuEnum.limit ? limitColumns : columns}
          rowKey={(record: { transactionHash: string }) => record?.transactionHash}
          pageSize={pageSize}
          pageNum={pageNum}
          emptyType="nodata"
          className="transaction-box"
        />
      </div>

      <LimitCancelModal ref={limitCancelModalRef} onSuccess={onLimitCanceled} />

      <LimitDetailModal ref={limitDetailModalRef} />
    </div>
  );
}
