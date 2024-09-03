import { MutableRefObject, useMemo } from 'react';
import { ColumnsType } from 'antd/es/table';
import { LimitOrderStatusEnum, LiquidityRecord, RecentTransaction, TLimitRecordItem } from 'types/transactions';
import Font from 'components/Font';
import moment from 'moment';
import { TTradePair } from 'types/pair';
import { getLimitOrderPrice } from 'utils/limit';
import { formatSymbol, getTokenWeights } from 'utils/token';
import { useTranslation } from 'react-i18next';
import { LimitOrderCancelAllowStatus, LimitOrderStatusMap } from 'constants/limit';
import { stringMidShort } from 'utils/string';
import { getExploreLink } from 'utils';
import CommonCopy from 'components/CommonCopy';
import { SortOrder } from 'antd/lib/table/interface';
import { TranslationMenuEnum } from 'pages/Transactions/hooks/useGetList';
import CommonTooltip from 'components/CommonTooltip';
import { SwapOrderRouting } from 'pages/Swap/components/SwapOrderRouting';
import FeeRate from 'components/FeeRate';
import { formatPercentage, formatPriceChange } from 'utils/price';
import { getSideTitle } from '../FilterSid';
import BigNumber from 'bignumber.js';
import { getRealReceivePriceWithDexFee } from 'utils/calculate';
import PriceDigits from 'components/PriceDigits';
import getFontStyle from 'utils/getFontStyle';
import { Pairs, Pair } from 'components/Pair';
import { CurrencyLogos } from 'components/CurrencyLogo';
import PriceUSDDigits from 'components/PriceUSDDigits';
import { ONE, ZERO } from 'constants/misc';
import { LimitCancelModalInterface } from 'Modals/LimitCancelModal';
import { LimitDetailModalInterface } from 'Modals/LimitDetailModal';

export type TUseTransactionColumnsProps = {
  menu?: string | number;
  field?: string | null;
  order?: SortOrder;
  side: number;
};
export const useTransactionColumns = ({ menu, field, order, side }: TUseTransactionColumnsProps) => {
  const { t } = useTranslation();

  return useMemo<ColumnsType<RecentTransaction | LiquidityRecord>>(() => {
    const isTrade = menu === TranslationMenuEnum.trade;
    const columnList: ColumnsType<RecentTransaction | LiquidityRecord> = [
      {
        title: t('timestamp'),
        width: 94,
        key: 'timestamp',
        dataIndex: 'timestamp',
        sorter: true,
        sortOrder: field === 'timestamp' ? order : null,
        render: (val: string) => (
          <Font lineHeight={20} size={12}>
            {moment(val).format('YYYY-MM-DD HH:mm:ss')}
          </Font>
        ),
      },
      {
        title: t('pairs'),
        key: 'tradePair',
        dataIndex: 'tradePair',
        sorter: true,
        width: 214,
        align: 'left',
        sortOrder: field === 'tradePair' ? order : null,
        render: (tradePair: TTradePair, record: RecentTransaction) => {
          return (
            <div className="pair-area">
              <div className="pair-logo-wrap">
                <CurrencyLogos
                  isSortToken={record.side !== 2}
                  size={16}
                  tokens={[tradePair.token0, tradePair.token1]}
                />
              </div>
              <div className="pair-label-wrap">
                <Pairs
                  isAutoOrder={record.side !== 2}
                  tokenA={tradePair?.token0}
                  tokenB={tradePair?.token1}
                  lineHeight={20}
                  size={14}
                  weight="medium"
                />
              </div>
              <div className="swap-order-routing-tip-wrap">
                {record.side === 2 ? (
                  <CommonTooltip
                    width={'400px'}
                    placement="top"
                    title={<SwapOrderRouting percentRoutes={record.percentRoutes} />}
                    getPopupContainer={(v) => v}
                    buttonTitle={t('ok')}
                    headerDesc={t('Order Routing')}>
                    <FeeRate useBg usePercent={false}>
                      {`Swap`}
                    </FeeRate>
                  </CommonTooltip>
                ) : (
                  <FeeRate useBg>{formatPercentage(tradePair?.feeRate * 100)}</FeeRate>
                )}
              </div>
            </div>
          );
        },
      },
      {
        title: t(getSideTitle(side)),
        key: 'side',
        width: 50,
        dataIndex: 'side',
        align: 'left',
        // filteredValue: [side],
        // filters: filterSidSource,
        // filterMultiple: false,
        // filterIcon: () => <IconFilterPc />,
        // filterDropdown: (props: any) => <FilterSidInTable {...props} />,
        render: (side: number, record: RecentTransaction) => {
          if (side === 2) {
            return (
              <Font lineHeight={20} size={14}>
                {t('Swap')}
              </Font>
            );
          }
          const isReverse =
            // trade pair sort
            getTokenWeights(record.tradePair.token0.symbol) > getTokenWeights(record.tradePair.token1.symbol) &&
            // contract sort
            record.tradePair.token0.symbol < record.tradePair.token1.symbol;
          const isBuy = Boolean(Number(side === 0) ^ Number(isReverse));
          return (
            <Font lineHeight={20} size={14} color={isBuy ? 'rise' : 'fall'}>
              {isBuy ? t('buy') : t('sell')}
            </Font>
          );
        },
      },
      {
        title: t('price'),
        key: 'price',
        dataIndex: 'price',
        align: 'left',
        width: 116,
        render: (_val: BigNumber, record: RecentTransaction) => {
          const price = getRealReceivePriceWithDexFee({
            side: record.side,
            token0Amount: record.token0Amount,
            token1Amount: record.token1Amount,
            dexFee: record.totalFee,
          });
          const _symbol = record.side !== 0 ? record.tradePair.token0.symbol : record.tradePair.token1.symbol;

          return (
            <>
              <PriceDigits className={getFontStyle({ lineHeight: 20 })} price={price} />
              &nbsp;
              <Pair lineHeight={24} symbol={_symbol} />
            </>
          );
        },
      },
      {
        title: isTrade ? t('Pay') : t('amount'),
        key: 'token0Amount',
        dataIndex: 'token0Amount',
        width: 132,
        align: 'left',
        render: (token0Amount: string | undefined, record: RecentTransaction) => {
          let _amount = token0Amount;
          let _symbol = record?.tradePair?.token0?.symbol;
          if (isTrade && record.side === 0) {
            _amount = record.token1Amount;
            _symbol = record?.tradePair?.token1?.symbol;
          }

          return (
            <>
              <Font lineHeight={20} size={14}>
                {formatPriceChange(_amount)}
              </Font>
              &nbsp;
              <Pair lineHeight={20} size={14} symbol={_symbol} />
            </>
          );
        },
      },
      {
        title: isTrade ? t('Receive') : t('amount'),
        key: 'token1Amount',
        dataIndex: 'token1Amount',
        align: 'left',
        width: 132,
        render: (token1Amount: string | undefined, record: RecentTransaction) => {
          let _amount = token1Amount;
          let _symbol = record?.tradePair?.token1?.symbol;
          if (isTrade && record.side === 0) {
            _amount = record.token0Amount;
            _symbol = record?.tradePair?.token0?.symbol;
          }
          return (
            <>
              <Font lineHeight={24}>{formatPriceChange(_amount)}</Font>
              &nbsp;
              <Pair lineHeight={24} symbol={_symbol} />
            </>
          );
        },
      },
      {
        title: t('TotalValue'),
        key: 'totalPriceInUsd',
        dataIndex: 'totalPriceInUsd',
        align: 'left',
        // sorter: true,
        width: 116,
        // sortOrder: field === 'realTotalPriceInUsd' ? order : null,
        render: (_val: number) => {
          return <PriceUSDDigits className={getFontStyle({ lineHeight: 24 })} price={_val} />;
        },
      },
      {
        title: t('Average Price'),
        key: 'averagePrice',
        dataIndex: 'price',
        align: 'left',
        width: 116,
        render: (val: BigNumber, record: RecentTransaction) => {
          const _val = record.side !== 1 ? val : ONE.div(val).toFixed();
          const _symbol = record.side !== 0 ? record.tradePair.token0.symbol : record.tradePair.token1.symbol;

          return (
            <>
              <PriceDigits className={getFontStyle({ lineHeight: 20 })} price={_val} />
              &nbsp;
              <Pair lineHeight={24} symbol={_symbol} />
            </>
          );
        },
      },
      {
        title: (
          <>
            {isTrade && <div>{t('LP Fee')}</div>}
            {isTrade ? <div>{t('Fee')}</div> : <div>{t('transactionFee')}</div>}
          </>
        ),
        key: 'totalFee',
        dataIndex: 'totalFee',
        align: 'left',
        width: 114,
        render: (val: number, record: RecentTransaction) => {
          return (
            <>
              {isTrade && (
                <div>
                  <Font lineHeight={20} size={12}>{`-${ZERO.plus(val)
                    .dp(record?.tradePair?.[record.side === 0 ? 'token1' : 'token0']?.decimals)
                    .toFixed()}`}</Font>
                  &nbsp;
                  <Pair
                    lineHeight={20}
                    size={12}
                    symbol={record?.tradePair?.[record.side === 0 ? 'token1' : 'token0']?.symbol}
                  />
                </div>
              )}
              {isTrade ? (
                <div>
                  <Font lineHeight={20} size={12}>
                    {`-${ZERO.plus(record.labsFee || 0)
                      .dp(record?.tradePair?.[record.side === 0 ? 'token0' : 'token1']?.decimals)
                      .toFixed()}`}
                  </Font>
                  &nbsp;
                  <Pair
                    lineHeight={20}
                    size={12}
                    symbol={record?.tradePair?.[record.side === 0 ? 'token0' : 'token1']?.symbol}
                  />
                </div>
              ) : (
                <Font lineHeight={20} size={12}>
                  {`-${ZERO.plus(record.transactionFee || 0)
                    .dp(8)
                    .toFixed()} ELF`}
                </Font>
              )}
            </>
          );
        },
      },
      {
        title: (
          <>
            <div>{t('transactionID')}</div>
            {isTrade && <div>{t('transactionFee')}</div>}
          </>
        ),
        key: 'transactionHash',
        dataIndex: 'transactionHash',
        align: 'right',
        width: 110,
        render: (val: string, record: RecentTransaction) => {
          return (
            <>
              <div className="transaction-hash-wrap">
                <div className="transaction-hash-label">
                  <a target="_blank" href={getExploreLink(val, 'transaction')} className="transaction-hash-link">
                    {stringMidShort(val)}
                  </a>
                </div>
                <CommonCopy copyInfo="" copyValue={val} className="copy-address" />
              </div>
              {isTrade && (
                <Font lineHeight={20} size={12}>
                  {`-${ZERO.plus(record.transactionFee || 0)
                    .dp(8)
                    .toFixed()} ELF`}
                </Font>
              )}
            </>
          );
        },
      },
    ];

    if (!isTrade) {
      columnList.splice(6, 2);
      columnList.splice(2, 2);
    }

    return columnList;
  }, [t, menu, field, order, side]);
};

export type TUseLimitColumnsProps = {
  limitCancelModalRef: MutableRefObject<LimitCancelModalInterface | undefined>;
  limitDetailModalRef: MutableRefObject<LimitDetailModalInterface | undefined>;
};
export const useLimitColumns = ({ limitCancelModalRef, limitDetailModalRef }: TUseLimitColumnsProps) => {
  const { t } = useTranslation();

  return useMemo<ColumnsType<TLimitRecordItem>>(() => {
    const columnList: ColumnsType<TLimitRecordItem> = [
      {
        title: t('Order Time'),
        width: 80,
        key: 'commitTime',
        dataIndex: 'commitTime',
        // sorter: true,
        // sortOrder: field === 'timestamp' ? order : null,
        render: (val: string) => (
          <Font lineHeight={20} size={12}>
            {moment(val).format('YYYY-MM-DD HH:mm:ss')}
          </Font>
        ),
      },
      {
        title: t('Order Price'),
        key: 'price',
        dataIndex: 'tradePair',
        width: 160,
        align: 'left',
        // sorter: true,
        // sortOrder: field === 'tradePair' ? order : null,
        render: (_tradePair: TTradePair, record: TLimitRecordItem) => (
          <>
            <PriceDigits className={getFontStyle({ lineHeight: 20 })} price={getLimitOrderPrice(record)} />
            <Font lineHeight={20} size={14}>
              {` ${formatSymbol(record.symbolIn)}/${formatSymbol(record.symbolOut)}`}
            </Font>
          </>
        ),
      },
      {
        title: (
          <>
            <div>{`${t('Filled')}/`}</div>
            <div>{t('Pay')}</div>
          </>
        ),
        key: 'amountIn',
        width: 200,
        dataIndex: 'amountIn',
        align: 'left',
        render: (amountIn: string, record: TLimitRecordItem) => {
          const symbolIn = formatSymbol(record.symbolIn);
          return (
            <>
              <div>
                <Font lineHeight={20} size={14}>{`${formatPriceChange(record.amountInFilled)} ${symbolIn}`}</Font>
              </div>
              <Font lineHeight={20} size={14}>
                {`${formatPriceChange(amountIn)} ${symbolIn}`}
              </Font>
            </>
          );
        },
      },
      {
        title: (
          <>
            <div>{`${t('Filled')}/`}</div>
            <div>{t('Receive')}</div>
          </>
        ),
        key: 'amountOut',
        width: 200,
        dataIndex: 'amountOut',
        align: 'left',
        render: (amountOut: string, record: TLimitRecordItem) => {
          const symbolOut = formatSymbol(record.symbolOut);
          return (
            <>
              <div>
                <Font lineHeight={20} size={14}>{`${formatPriceChange(record.amountOutFilled)} ${symbolOut}`}</Font>
              </div>
              <Font lineHeight={20} size={14}>
                {`${formatPriceChange(amountOut)} ${symbolOut}`}
              </Font>
            </>
          );
        },
      },
      {
        title: t('Expires'),
        key: 'deadline',
        dataIndex: 'deadline',
        align: 'left',
        width: 160,
        render: (deadline: number) => {
          return (
            <Font lineHeight={20} size={14}>
              {`${moment(deadline).format('YYYY-MM-DD HH:mm:ss')}`}
            </Font>
          );
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
        width: 120,
        dataIndex: 'totalFee',
        align: 'left',
        render: (totalFee: string, record: TLimitRecordItem) => {
          return (
            <>
              <div>
                <Font lineHeight={20} size={14}>{`-${ZERO.plus(totalFee || 0)
                  .dp(record.tradePair.token1.decimals)
                  .toFixed()} ${formatSymbol(record.symbolOut)}`}</Font>
              </div>
              <Font lineHeight={20} size={14}>
                {`-${ZERO.plus(record.networkFee || 0)
                  .dp(8)
                  .toFixed()} ELF`}
              </Font>
            </>
          );
        },
      },
      {
        title: t('transactionID'),
        key: 'transactionHash',
        dataIndex: 'transactionHash',
        align: 'left',
        width: 112,
        render: (val: string) => (
          <div className="transaction-hash-wrap limit-transaction-hash-wrap">
            <div className="transaction-hash-label">
              <a target="_blank" href={getExploreLink(val, 'transaction')} className="transaction-hash-link">
                {stringMidShort(val)}
              </a>
            </div>
            <CommonCopy copyInfo="" copyValue={val} className="copy-address" />
          </div>
        ),
      },
      {
        title: t('Status'),
        key: 'limitOrderStatus',
        dataIndex: 'limitOrderStatus',
        align: 'left',
        width: 100,
        render: (val: LimitOrderStatusEnum) => (
          <Font size={12} lineHeight={16} color={LimitOrderStatusMap[val]?.color}>
            {t(LimitOrderStatusMap[val]?.label)}
          </Font>
        ),
      },
      {
        title: t('Operation'),
        key: 'operation',
        dataIndex: 'limitOrderStatus',
        align: 'right',
        width: 100,
        render: (val: LimitOrderStatusEnum, record: TLimitRecordItem) => (
          <div className="limit-operation-area">
            {LimitOrderCancelAllowStatus.includes(val) && (
              <>
                <div className="limit-operation-btn" onClick={() => limitCancelModalRef?.current?.show({ record })}>
                  {t('cancel')}
                </div>
                <div className="limit-operation-split" />
              </>
            )}
            <div className="limit-operation-btn" onClick={() => limitDetailModalRef?.current?.show({ record })}>
              {t('Details')}
            </div>
          </div>
        ),
      },
    ];

    return columnList;
  }, [limitCancelModalRef, limitDetailModalRef, t]);
};
