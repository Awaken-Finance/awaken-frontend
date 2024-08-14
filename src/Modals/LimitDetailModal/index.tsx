import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import CommonModal from 'components/CommonModal';
import CommonButton from 'components/CommonButton';
import './styles.less';
import { useActiveWeb3React } from 'hooks/web3';
import { getExploreLink, sleep } from 'utils';
import { useMobile } from 'utils/isMobile';
import { useAElfContract } from 'hooks/useContract';
import { LIMIT_CONTRACT_ADDRESS } from 'constants/index';
import { TLimitDetailItem, TLimitRecordItem } from 'types/transactions';
import { cancelLimit } from 'utils/limit';
import { REQ_CODE } from 'constants/misc';
import { CommonTable } from 'components/CommonTable';
import { getLimitDetailList } from 'api/utils/recentTransaction';
import { ColumnsType } from 'antd/es/table';
import Font from 'components/Font';
import moment from 'moment';
import { stringMidShort } from 'utils/string';
import CommonCopy from 'components/CommonCopy';
import { FetchParam } from 'types/requeset';

export type TLimitDetailModalProps = {};

export type TLimitDetailModalInfo = {
  orderId: number;
};
export interface LimitCancelModalInterface {
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
  }, []);

  const [list, setList] = useState<TLimitDetailItem[]>([]);

  const [pagination, setPagination] = useState({ ...INIT_PAGINATION });
  const paginationRef = useRef(pagination);
  paginationRef.current = pagination;

  const getData = useCallback(async (params?: FetchParam) => {
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
        orderId: 1,
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
  }, []);
  const getDataRef = useRef(getData);
  getDataRef.current = getData;

  useEffect(() => {
    // getData();
  }, []);

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
        render: (amountInFilled: string, record: TLimitDetailItem) => (
          <Font lineHeight={20} size={14}>
            {1}
          </Font>
        ),
      },
      {
        title: t('Pay'),
        key: 'amountInFilled',
        dataIndex: 'amountInFilled',
        width: 160,
        align: 'left',
        // sorter: true,
        // sortOrder: field === 'tradePair' ? order : null,
        render: (amountInFilled: string, record: TLimitDetailItem) => (
          <Font lineHeight={20} size={14}>
            {1}
          </Font>
        ),
      },
      {
        title: t('Receive'),
        key: 'amountOutFilled',
        dataIndex: 'amountOutFilled',
        width: 160,
        align: 'left',
        render: (amountOutFilled: string, record: TLimitDetailItem) => (
          <Font lineHeight={20} size={14}>
            {1}
          </Font>
        ),
      },
      {
        title: t('Total value'),
        key: 'amountOutFilledUSD',
        dataIndex: 'amountOutFilledUSD',
        width: 100,
        align: 'left',
        render: (amountOutFilledUSD: string, record: TLimitDetailItem) => (
          <Font lineHeight={20} size={14}>
            {1}
          </Font>
        ),
      },
      {
        title: (
          <>
            <div>{`${t('Fee')}/`}</div>
            <div>{t('Network Cost')}</div>
          </>
        ),
        key: 'totalFee',
        width: 100,
        dataIndex: 'totalFee',
        align: 'left',
        render: (totalFee: string, record: TLimitDetailItem) => {
          return (
            <Font lineHeight={20} size={14}>
              {1}
            </Font>
          );
        },
      },
      {
        title: t('Status'),
        key: 'status',
        dataIndex: 'status',
        width: 60,
        align: 'left',
        render: (status: number, record: TLimitDetailItem) => (
          <Font lineHeight={20} size={14}>
            {1}
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
  }, [t]);

  const show = useCallback<LimitCancelModalInterface['show']>(async ({ orderId }) => {
    orderIdRef.current = orderId;
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
