import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CommonModal from 'components/CommonModal';
import './styles.less';
import { TLimitDetailItem, TLimitRecordItem } from 'types/transactions';
import { getLimitDetailList as _getLimitDetailList } from 'api/utils/recentTransaction';
import { FetchParam } from 'types/requeset';
import { useReturnLastCallback } from 'hooks';
import { useMobile } from 'utils/isMobile';
import { LimitDetailWebList } from './components/LimitDetailWebList';
import { LimitDetailMobileList } from './components/LimitDetailMobileList';

export type TLimitDetailModalProps = {};

export type TLimitDetailModalInfo = {
  record: TLimitRecordItem;
};
export interface LimitDetailModalInterface {
  show: (params: TLimitDetailModalInfo) => void;
}

const INIT_PAGINATION = {
  total: 0,
  pageSize: 10,
  page: 1,
};

export const LimitDetailModal = forwardRef((_: TLimitDetailModalProps, ref) => {
  const { t } = useTranslation();
  const isMobile = useMobile();

  const [isVisible, setIsVisible] = useState(false);
  const orderIdRef = useRef(0);

  const [isLoading, setIsLoading] = useState(false);
  const isLoadingRef = useRef(false);
  const [list, setList] = useState<TLimitDetailItem[]>([]);

  const onCancel = useCallback(() => {
    if (isLoadingRef.current) return;
    setIsVisible(false);
    setPagination({ ...INIT_PAGINATION });
    setList([]);
    orderIdRef.current = 0;
  }, []);

  const getLimitDetailList = useReturnLastCallback(_getLimitDetailList, []);

  const [pagination, setPagination] = useState({ ...INIT_PAGINATION });
  const paginationRef = useRef(pagination);
  paginationRef.current = pagination;

  const getData = useCallback(
    async (params?: FetchParam) => {
      let page = 1,
        pageSize = paginationRef.current.pageSize;
      setIsLoading(true);
      try {
        if (params) {
          setPagination((pre) => ({
            ...pre,
            pageSize: params.pageSize ?? pre.pageSize,
            page: params.page ?? pre.page,
          }));
          page = params.page ?? page;
          pageSize = params.pageSize ?? pageSize;
        }

        const result = await getLimitDetailList({
          orderId: orderIdRef.current,
          skipCount: (page - 1) * pageSize,
          maxResultCount: pageSize,
        });
        if (isMobile && page !== 1) {
          setList((pre) => [...pre, ...(result.items || [])]);
        } else {
          setList(result.items || []);
        }

        setPagination((pre) => ({
          ...pre,
          total: result.totalCount || 0,
        }));
      } catch (error) {
        console.log('LimitDetailModal', error);
      } finally {
        setIsLoading(false);
      }
    },
    [getLimitDetailList, isMobile],
  );
  const getDataRef = useRef(getData);
  getDataRef.current = getData;

  const [record, setRecord] = useState<TLimitRecordItem>();

  const show = useCallback<LimitDetailModalInterface['show']>(async ({ record }) => {
    orderIdRef.current = record.orderId;
    setRecord(record);
    getDataRef.current();
    setIsVisible(true);
  }, []);
  useImperativeHandle(ref, () => ({ show }));

  return (
    <CommonModal
      width="1104px"
      height={isMobile ? '100%' : '240px'}
      showType={isMobile ? 'drawer' : 'modal'}
      showBackIcon={isMobile}
      closable={!isMobile}
      centered={true}
      visible={isVisible}
      title={t('Details')}
      className={'limit-detail-modal'}
      onCancel={onCancel}>
      <div className="limit-detail-content">
        {isMobile ? (
          <LimitDetailMobileList
            dataSource={list}
            pageNum={pagination.page}
            pageSize={pagination.pageSize}
            total={pagination.total}
            loading={isLoading}
            getData={getData}
            record={record}
          />
        ) : (
          <LimitDetailWebList
            record={record}
            onChange={getData}
            total={pagination.total}
            isLoading={isLoading}
            dataSource={list}
            pageSize={pagination.pageSize}
            pageNum={pagination.page}
          />
        )}
      </div>
    </CommonModal>
  );
});
