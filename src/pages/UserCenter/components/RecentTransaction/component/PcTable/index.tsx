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
import { getExploreLink, shortenTransactionId } from 'utils';

import './index.less';
import { getTokenWeights } from 'utils/token';
import PriceDigits from 'components/PriceDigits';
import getFontStyle from 'utils/getFontStyle';
import PriceUSDDigits from 'components/PriceUSDDigits';

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
    const list: ColumnsType<RecentTransaction | LiquidityRecord> = [
      {
        title: t('timestamp'),
        key: 'timestamp',
        dataIndex: 'timestamp',
        sorter: true,
        sortOrder: field === 'timestamp' ? order : null,
        render: (val: string) => <Font lineHeight={24}>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</Font>,
      },
      {
        title: t('pairs'),
        key: 'tradePair',
        dataIndex: 'tradePair',
        sorter: true,
        sortOrder: field === 'tradePair' ? order : null,
        render: (tradePair: TradePair) => (
          <Row gutter={[8, 0]} align="middle">
            <Col>
              <CurrencyLogos size={24} tokens={[tradePair.token0, tradePair.token1]} />
            </Col>
            <Col>
              <Pairs tokenA={tradePair?.token0?.symbol} tokenB={tradePair?.token1} lineHeight={24} weight="medium" />
            </Col>
            <Col>
              <FeeRate useBg>{formatPercentage(tradePair?.feeRate * 100)}</FeeRate>
            </Col>
          </Row>
        ),
      },
      {
        title: t(getSideTitle(side)),
        key: 'side',
        dataIndex: 'side',
        // filteredValue: [side],
        // filters: filterSidSource,
        // filterMultiple: false,
        // filterIcon: () => <IconFilterPc />,
        // filterDropdown: (props: any) => <FilterSidInTable {...props} />,
        render: (val: number, record: RecentTransaction) => (
          <Font
            lineHeight={24}
            color={
              getTokenWeights(record.tradePair.token0.symbol) > getTokenWeights(record.tradePair.token1.symbol) &&
              record.tradePair.token0.symbol < record.tradePair.token1.symbol
                ? val === 0
                  ? 'fall'
                  : 'rise'
                : val === 0
                ? 'rise'
                : 'fall'
            }>
            {getTokenWeights(record.tradePair.token0.symbol) > getTokenWeights(record.tradePair.token1.symbol) &&
            record.tradePair.token0.symbol < record.tradePair.token1.symbol
              ? val === 0
                ? t('sell')
                : t('buy')
              : val === 0
              ? t('buy')
              : t('sell')}
          </Font>
        ),
      },
      {
        title: t('price'),
        key: 'price',
        dataIndex: 'price',
        align: 'right',
        render: (val: BigNumber) => <PriceDigits className={getFontStyle({ lineHeight: 20 })} price={val} />,
      },
      {
        title: t('amount'),
        key: 'token0Amount',
        dataIndex: 'token0Amount',
        align: 'right',
        render: (val: number, record: RecentTransaction) => (
          <>
            <Font lineHeight={24}>{formatPriceChange(val)}</Font>
            &nbsp;
            <Pair lineHeight={24} symbol={record?.tradePair?.token0?.symbol} />
          </>
        ),
      },
      {
        title: menu !== 'all' ? t('amount') : t('total'),
        key: 'token1Amount',
        dataIndex: 'token1Amount',
        align: 'right',
        render: (val: number, record: RecentTransaction) => (
          <>
            <Font lineHeight={24}>{formatPriceChange(val)}</Font>
            &nbsp;
            <Pair lineHeight={24} symbol={record?.tradePair?.token1?.symbol} />
          </>
        ),
      },
      {
        title: t('TotalValue'),
        key: 'totalPriceInUsd',
        dataIndex: 'totalPriceInUsd',
        align: 'right',
        sorter: true,
        sortOrder: field === 'totalPriceInUsd' ? order : null,
        render: (val: BigNumber) => <PriceUSDDigits className={getFontStyle({ lineHeight: 24 })} price={val} />,
      },
      {
        title: t('Fee'),
        key: 'totalFee',
        dataIndex: 'totalFee',
        align: 'right',
        render: (val: number, record: RecentTransaction) => (
          <>
            <Font lineHeight={24}>{new BigNumber(val).dp(8)}</Font>&nbsp;
            <Pair lineHeight={24} symbol={record?.tradePair?.[record.side === 0 ? 'token1' : 'token0']?.symbol} />
          </>
        ),
      },
      {
        title: t('transactionFee'),
        key: 'transactionFee',
        dataIndex: 'transactionFee',
        align: 'right',
        render: (val: number) => <Font lineHeight={24}>{`${new BigNumber(val).dp(8)} ELF`}</Font>,
      },
      {
        title: t('transactionID'),
        key: 'transactionHash',
        dataIndex: 'transactionHash',
        align: 'right',
        render: (val: string) => (
          <Row>
            <Col flex={1}>
              <a target="_blank" href={getExploreLink(val, 'transaction')} style={{ wordBreak: 'break-all' }}>
                {shortenTransactionId(val)}
              </a>
            </Col>
            <Col flex={'32px'}>
              <CommonCopy copyInfo="" copyValue={val} className="copy-address" />
            </Col>
          </Row>
        ),
      },
    ];

    if (menu !== 'all') {
      list.splice(6, 2);
      list.splice(2, 2);
    }

    return list;
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
      <div className="transation-table-box">
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
          className="transation-box"
        />
      </div>
    </div>
  );
}
