import { useMemo } from 'react';
import { Row, Col } from 'antd';
import { ColumnsType } from 'antd/es/table';
import BigNumber from 'bignumber.js';
import { useTranslation } from 'react-i18next';
import moment from 'moment';

import { TradePair } from 'pages/UserCenter/type';
import { CommonTable } from 'components/CommonTable';
import Font from 'components/Font';
import { CurrencyLogos } from 'components/CurrencyLogo';
import { Pairs, Pair } from 'components/Pair';
import FeeRate from 'components/FeeRate';
import { formatPercentage, formatPriceChange } from 'utils/price';
import { RecentTransaction, LiquidityRecord } from '../../../../type';
import CommonCopy from 'components/CommonCopy';
import CommonMenu from 'components/CommonMenu';
import SearchTairByName from 'components/SearchTairByName';
import { getSideTitle } from '../FilterSid';
import { FetchParam } from 'types/requeset';
import { SortOrder } from 'antd/lib/table/interface';
import { getExploreLink } from 'utils';

import './index.less';
import { getTokenWeights } from 'utils/token';
import PriceDigits from 'components/PriceDigits';
import getFontStyle from 'utils/getFontStyle';
import PriceUSDDigits from 'components/PriceUSDDigits';
import { getRealPrice, getRealToken0Amount, getRealToken1Amount } from 'utils/calculate';
import { ZERO } from 'constants/misc';
import { stringMidShort } from 'utils/string';

export default function PcTable({
  dataSource,
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

  const columns = useMemo<ColumnsType<RecentTransaction | LiquidityRecord>>(() => {
    const isAll = menu === 'all';

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
        width: 212,
        align: 'left',
        sortOrder: field === 'tradePair' ? order : null,
        render: (tradePair: TradePair) => (
          <div className="pair-area">
            <div className="pair-logo-wrap">
              <CurrencyLogos size={16} tokens={[tradePair.token0, tradePair.token1]} />
            </div>
            <div className="pair-label-wrap">
              <Pairs tokenA={tradePair?.token0} tokenB={tradePair?.token1} lineHeight={20} size={14} weight="medium" />
            </div>
            <div>
              <FeeRate useBg>{formatPercentage(tradePair?.feeRate * 100)}</FeeRate>
            </div>
          </div>
        ),
      },
      {
        title: t(getSideTitle(side)),
        key: 'side',
        width: 42,
        dataIndex: 'side',
        align: 'left',
        // filteredValue: [side],
        // filters: filterSidSource,
        // filterMultiple: false,
        // filterIcon: () => <IconFilterPc />,
        // filterDropdown: (props: any) => <FilterSidInTable {...props} />,
        render: (side: number, record: RecentTransaction) => {
          const isRevert =
            // trade pair sort
            getTokenWeights(record.tradePair.token0.symbol) > getTokenWeights(record.tradePair.token1.symbol) &&
            // contract sort
            record.tradePair.token0.symbol < record.tradePair.token1.symbol;
          const isBuy = Boolean(Number(side === 0) ^ Number(isRevert));
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
          const price = getRealPrice({
            side: record.side,
            token0Amount: record.token0Amount,
            token1Amount: record.token1Amount,
            feeRate: record.tradePair.feeRate,
          });
          return <PriceDigits className={getFontStyle({ lineHeight: 20 })} price={price} />;
        },
      },
      {
        title: t('amount'),
        key: 'token0Amount',
        dataIndex: 'token0Amount',
        width: 132,
        align: 'left',
        render: (token0Amount: number, record: RecentTransaction) => {
          const amount = getRealToken0Amount({
            side: record.side,
            value: token0Amount,
            feeRate: record.tradePair.feeRate,
            decimals: record.tradePair.token0.decimals,
          });
          return (
            <>
              <Font lineHeight={20} size={14}>
                {formatPriceChange(isAll ? amount : token0Amount)}
              </Font>
              &nbsp;
              <Pair lineHeight={20} size={14} symbol={record?.tradePair?.token0?.symbol} />
            </>
          );
        },
      },
      {
        title: isAll ? t('total') : t('amount'),
        key: 'token1Amount',
        dataIndex: 'token1Amount',
        align: 'left',
        width: 132,
        render: (token1Amount: number, record: RecentTransaction) => {
          const amount = getRealToken1Amount({
            side: record.side,
            value: token1Amount,
            feeRate: record.tradePair.feeRate,
            decimals: record.tradePair.token1.decimals,
          });
          return (
            <>
              <Font lineHeight={24}>{formatPriceChange(isAll ? amount : token1Amount)}</Font>
              &nbsp;
              <Pair lineHeight={24} symbol={record?.tradePair?.token1?.symbol} />
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
        render: (_val: number, record: RecentTransaction) => {
          const amount = getRealToken1Amount({
            side: record.side,
            value: record.totalPriceInUsd,
            feeRate: record.tradePair.feeRate,
          });
          return <PriceUSDDigits className={getFontStyle({ lineHeight: 24 })} price={amount} />;
        },
      },
      {
        title: t('Average Price'),
        key: 'averagePrice',
        dataIndex: 'price',
        align: 'left',
        width: 116,
        render: (val: BigNumber) => <PriceDigits className={getFontStyle({ lineHeight: 20 })} price={val} />,
      },
      {
        title: (
          <>
            {isAll && <div>{t('Fee')}</div>}
            <div>{t('transactionFee')}</div>
          </>
        ),
        key: 'totalFee',
        dataIndex: 'totalFee',
        align: 'left',
        width: 114,
        render: (val: number, record: RecentTransaction) => {
          const transactionFee = ZERO.plus(record.transactionFee || 0)
            .dp(8)
            .toFixed();
          return (
            <>
              {isAll && (
                <div>
                  <Font lineHeight={20} size={12}>{`-${ZERO.plus(val).dp(8).toFixed()}`}</Font>&nbsp;
                  <Pair
                    lineHeight={20}
                    size={12}
                    symbol={record?.tradePair?.[record.side === 0 ? 'token1' : 'token0']?.symbol}
                  />
                </div>
              )}
              <Font lineHeight={20} size={12}>
                {`-${transactionFee} ELF`}
              </Font>
            </>
          );
        },
      },
      {
        title: t('transactionID'),
        key: 'transactionHash',
        dataIndex: 'transactionHash',
        align: 'right',
        width: 110,
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

    if (!isAll) {
      columnList.splice(6, 2);
      columnList.splice(2, 2);
    }

    return columnList;
  }, [t, menu, field, order, side]);

  return (
    <div className="recent-tx-pc-table">
      <div className="pc-table-header">
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
        <CommonTable
          onChange={getData}
          total={total}
          loading={loading}
          dataSource={dataSource}
          columns={columns}
          rowKey={(record: { transactionHash: string }) => record?.transactionHash}
          pageSize={pageSize}
          pageNum={pageNum}
          emptyType="nodata"
          className="transaction-box"
        />
      </div>
    </div>
  );
}
