import { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CommonModal from 'components/CommonModal';
import './styles.less';
import { getExploreLink } from 'utils';
import { LimitOrderStatusEnum, TLimitDetailItem, TLimitRecordItem } from 'types/transactions';
import { ZERO } from 'constants/misc';
import { CommonTable } from 'components/CommonTable';
import { getLimitDetailList as _getLimitDetailList } from 'api/utils/recentTransaction';
import { ColumnsType } from 'antd/es/table';
import Font from 'components/Font';
import moment from 'moment';
import { stringMidShort } from 'utils/string';
import CommonCopy from 'components/CommonCopy';
import { FetchParam } from 'types/requeset';
import PriceDigits from 'components/PriceDigits';
import getFontStyle from 'utils/getFontStyle';
import { formatSymbol } from 'utils/token';
import { LimitDetailStatusMap } from 'constants/limit';
import PriceUSDDigits from 'components/PriceUSDDigits';
import { useReturnLastCallback } from 'hooks';

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

  const [isVisible, setIsVisible] = useState(false);
  const orderIdRef = useRef(0);

  const [isLoading, setIsLoading] = useState(false);
  const isLoadingRef = useRef(false);

  const onCancel = useCallback(() => {
    if (isLoadingRef.current) return;
    setIsVisible(false);
    setPagination({ ...INIT_PAGINATION });
    orderIdRef.current = 0;
  }, []);

  const getLimitDetailList = useReturnLastCallback(_getLimitDetailList, []);

  const [list, setList] = useState<TLimitDetailItem[]>([]);

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
        setList(result.items || []);
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
    [getLimitDetailList],
  );
  const getDataRef = useRef(getData);
  getDataRef.current = getData;

  const [record, setRecord] = useState<TLimitRecordItem>();

  const columns = useMemo<ColumnsType<TLimitDetailItem>>(() => {
    const columnList: ColumnsType<TLimitDetailItem> = [
      {
        title: t('Txn Time'),
        width: 144,
        key: 'transactionTime',
        dataIndex: 'transactionTime',
        render: (val: number) => (
          <Font lineHeight={16} size={12}>
            {moment(val).format('YYYY-MM-DD HH:mm:ss')}
          </Font>
        ),
      },
      {
        title: t('Price'),
        key: 'price',
        dataIndex: 'amountInFilled',
        width: 160,
        align: 'left',
        render: (_amountInFilled: string, _record: TLimitDetailItem) => {
          if (_record.status !== LimitOrderStatusEnum.PartiallyFilling)
            return (
              <Font lineHeight={20} size={14}>
                {'-'}
              </Font>
            );
          return (
            <>
              <PriceDigits
                className={getFontStyle({ lineHeight: 20 })}
                price={ZERO.plus(_record.amountOutFilled).div(_record.amountInFilled)}
              />
              <Font lineHeight={20} size={14}>
                {` ${formatSymbol(record?.symbolIn)}/${formatSymbol(record?.symbolOut)}`}
              </Font>
            </>
          );
        },
      },
      {
        title: t('Pay'),
        key: 'amountInFilled',
        dataIndex: 'amountInFilled',
        width: 160,
        align: 'left',
        render: (amountInFilled: string, _record: TLimitDetailItem) => {
          if (_record.status !== LimitOrderStatusEnum.PartiallyFilling)
            return (
              <Font lineHeight={20} size={14}>
                {'-'}
              </Font>
            );
          return (
            <Font lineHeight={20} size={14}>
              {`${ZERO.plus(amountInFilled).toFixed()} ${formatSymbol(record?.symbolIn)}`}
            </Font>
          );
        },
      },
      {
        title: t('Receive'),
        key: 'amountOutFilled',
        dataIndex: 'amountOutFilled',
        width: 160,
        align: 'left',
        render: (amountOutFilled: string, _record: TLimitDetailItem) => {
          if (_record.status !== LimitOrderStatusEnum.PartiallyFilling)
            return (
              <Font lineHeight={20} size={14}>
                {'-'}
              </Font>
            );
          return (
            <Font lineHeight={20} size={14}>
              {`${ZERO.plus(amountOutFilled).toFixed()} ${formatSymbol(record?.symbolOut)}`}
            </Font>
          );
        },
      },
      {
        title: t('Total value'),
        key: 'amountOutFilledUSD',
        dataIndex: 'amountOutFilledUSD',
        width: 100,
        align: 'left',
        render: (amountOutFilledUSD: string, _record: TLimitDetailItem) => {
          if (_record.status !== LimitOrderStatusEnum.PartiallyFilling)
            return (
              <Font lineHeight={20} size={14}>
                {'-'}
              </Font>
            );
          return <PriceUSDDigits className={getFontStyle({ lineHeight: 24 })} price={amountOutFilledUSD} />;
        },
      },
      {
        title: (
          <>
            <div>{`${t('Fee')}/`}</div>
            <div>{t('transactionFee')}</div>
          </>
        ),
        key: 'totalFee',
        width: 100,
        dataIndex: 'totalFee',
        align: 'left',
        render: (totalFee: string, _record: TLimitDetailItem) => {
          if (_record.status !== LimitOrderStatusEnum.PartiallyFilling)
            return (
              <>
                <div>
                  <Font lineHeight={20} size={14}>
                    {'-'}
                  </Font>
                </div>
                <div>
                  <Font lineHeight={20} size={14}>
                    {'-'}
                  </Font>
                </div>
              </>
            );
          return (
            <>
              <div>
                <Font lineHeight={20} size={14}>
                  {`${ZERO.plus(totalFee).toFixed()} ${formatSymbol('ELF')}`}
                </Font>
              </div>
              <div>
                <Font lineHeight={20} size={14}>
                  {`${ZERO.plus(_record.networkFee).toFixed()} ${formatSymbol('ELF')}`}
                </Font>
              </div>
            </>
          );
        },
      },
      {
        title: t('Status'),
        key: 'status',
        dataIndex: 'status',
        width: 60,
        align: 'left',
        render: (status: LimitOrderStatusEnum) => (
          <Font lineHeight={20} size={14} color={LimitDetailStatusMap[status].color}>
            {t(LimitDetailStatusMap[status].label)}
          </Font>
        ),
      },
      {
        title: t('transactionID'),
        key: 'transactionHash',
        dataIndex: 'transactionHash',
        align: 'right',
        width: 136,
        render: (val: string) => (
          <div className="transaction-hash-wrap">
            <div className="transaction-hash-label">
              <a target="_blank" href={getExploreLink(val, 'transaction')} className="transaction-hash-link">
                {stringMidShort(val)}
              </a>
            </div>
            <CommonCopy copyInfo="" copyValue={val} className="copy-address" />
          </div>
        ),
      },
    ];

    return columnList;
  }, [record?.symbolIn, record?.symbolOut, t]);

  const show = useCallback<LimitDetailModalInterface['show']>(async ({ record }) => {
    console.log('limitDetailModalRef');
    orderIdRef.current = record.orderId;
    setRecord(record);
    getDataRef.current();
    setIsVisible(true);
  }, []);
  useImperativeHandle(ref, () => ({ show }));

  return (
    <CommonModal
      width="1104px"
      height={'240px'}
      showType={'modal'}
      showBackIcon={false}
      closable={true}
      centered={true}
      visible={isVisible}
      title={t('Details')}
      className={'limit-detail-modal'}
      onCancel={onCancel}>
      <div className="limit-detail-content">
        <CommonTable
          onChange={getData}
          total={pagination.total}
          loading={isLoading}
          dataSource={list}
          columns={columns}
          rowKey={(record: { transactionHash: string }) => record?.transactionHash}
          pageSize={pagination.pageSize}
          pageNum={pagination.page}
          emptyType="nodata"
          className="transaction-box"
        />
      </div>
    </CommonModal>
  );
});
