import { CommonTable } from 'components/CommonTable';
import { useMemo } from 'react';
import { ColumnsType } from 'antd/es/table';
import { LimitOrderStatusEnum, TLimitDetailItem, TLimitRecordItem } from 'types/transactions';
import Font from 'components/Font';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import PriceDigits from 'components/PriceDigits';
import { formatSymbol } from 'utils/token';
import { ZERO } from 'constants/misc';
import getFontStyle from 'utils/getFontStyle';
import PriceUSDDigits from 'components/PriceUSDDigits';
import { LIMIT_STATUS_WITH_GAS, LimitDetailStatusMap } from 'constants/limit';
import { stringMidShort } from 'utils/string';
import { getExploreLink } from 'utils';
import CommonCopy from 'components/CommonCopy';
import { FetchParam } from 'types/requeset';
import { formatPriceChange } from 'utils/price';

export type TLimitDetailWebListProps = {
  record?: TLimitRecordItem;
  pageSize?: number;
  pageNum?: number;
  total?: number;
  dataSource: TLimitDetailItem[];
  isLoading?: boolean;
  onChange?: (params?: FetchParam) => void;
};

export const LimitDetailWebList = ({
  record,
  pageSize,
  pageNum,
  total,
  dataSource,
  isLoading,
  onChange,
}: TLimitDetailWebListProps) => {
  const { t } = useTranslation();

  const columns = useMemo<ColumnsType<TLimitDetailItem>>(() => {
    const columnList: ColumnsType<TLimitDetailItem> = [
      {
        title: t('time'),
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
        title: t('price'),
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
                price={ZERO.plus(_record.amountInFilled).div(_record.amountOutFilled)}
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
              {`${formatPriceChange(amountInFilled)} ${formatSymbol(record?.symbolIn)}`}
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
              {`${formatPriceChange(amountOutFilled)} ${formatSymbol(record?.symbolOut)}`}
            </Font>
          );
        },
      },
      {
        title: t('TotalValue'),
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
        width: 144,
        dataIndex: 'totalFee',
        align: 'left',
        render: (totalFee: string, _record: TLimitDetailItem) => {
          return (
            <>
              <div>
                <Font lineHeight={20} size={14}>
                  {_record.status !== LimitOrderStatusEnum.PartiallyFilling
                    ? '-'
                    : `-${ZERO.plus(totalFee || 0)
                        .dp(record?.tradePair.token1.decimals || 0)
                        .toFixed()} ${formatSymbol(record?.symbolOut)}`}
                </Font>
              </div>
              <div>
                <Font lineHeight={20} size={14}>
                  {LIMIT_STATUS_WITH_GAS.includes(_record.status)
                    ? `-${ZERO.plus(_record.networkFee ?? 0)
                        .dp(8)
                        .toFixed()} ELF`
                    : '-'}
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
        width: 72,
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
  }, [record?.symbolIn, record?.symbolOut, record?.tradePair.token1.decimals, t]);

  return (
    <CommonTable
      onChange={onChange}
      total={total}
      loading={isLoading}
      dataSource={dataSource}
      columns={columns}
      rowKey={(record: { transactionHash: string }) => record?.transactionHash}
      pageSize={pageSize}
      pageNum={pageNum}
      emptyType="nodata"
      className="transaction-box"
    />
  );
};
