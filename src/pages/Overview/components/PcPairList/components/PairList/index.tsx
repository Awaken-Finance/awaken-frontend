import { useMemo } from 'react';
import { Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';
import { ColumnsType, SortOrder } from 'antd/lib/table/interface';

import FallOrRise from 'components/FallOrRise';
import { CollectionBtnInList } from 'Buttons/CollectionBtn';
import SwapBtn, { useGoSwapPage } from 'Buttons/SwapBtn';
import ManageLiquidityBtn from 'Buttons/ManageLiquidityBtn';
import { CommonTable } from 'components/CommonTable';
import { Pairs } from 'components/Pair';
import FeeRate from 'components/FeeRate';
import Font from 'components/Font';

import { PairItem } from 'types';
import { FetchParam } from 'types/requeset';
import { formatPercentage, formatPriceChange, formatPriceByNumberToFix } from 'utils/price';

import './index.less';
import BigNumber from 'bignumber.js';
import PriceDigits from 'components/PriceDigits';
import getFontStyle from 'utils/getFontStyle';
import PriceUSDDigits from 'components/PriceUSDDigits';
import { ZERO } from 'constants/misc';

interface PairListProps {
  dataSource: PairItem[];
  getData: (params: FetchParam) => void;
  pageSize?: number;
  pageNum?: number;
  total?: number;
  field?: string | null;
  order?: SortOrder;
  loading?: boolean;
  poolType?: string;
}

export default function ({ poolType, ...args }: PairListProps) {
  const { t } = useTranslation();

  const callback = useGoSwapPage();

  const columns: ColumnsType<PairItem> = useMemo(
    () => [
      {
        title: t('pairs'),
        width: 252,
        dataIndex: 'tradePair',
        key: 'tradePair',
        // sorter: true,
        sorter: (a: PairItem, b: PairItem) => (a.token0.symbol > b.token0.symbol ? 1 : -1),
        // sortOrder: field === 'tradePair' ? order : null,
        render: (name: string, pairData: PairItem) => {
          return (
            <Row align="top" wrap={false}>
              <Col className="pari-list-collect">
                <CollectionBtnInList favId={pairData.favId} id={pairData.id} isFav={pairData.isFav} />
              </Col>
              <Row gutter={[4, 0]}>
                <Col>
                  <Pairs tokenA={pairData.token0} tokenB={pairData.token1} />
                </Col>
                <Col>
                  <FeeRate useBg>{formatPercentage(pairData?.feeRate * 100)}</FeeRate>
                </Col>
              </Row>
            </Row>
          );
        },
      },
      {
        title: t('latestPrice'),
        width: 120,
        dataIndex: 'priceUSD',
        key: 'priceUSD',
        sorter: (a: PairItem, b: PairItem) => (a.priceUSD > b.priceUSD ? 1 : -1),
        // sortOrder: field === 'priceUSD' ? order : null,
        align: 'right',
        render: (priceUSD: string, record: PairItem) => (
          <div className="price-box">
            <PriceDigits price={record.price} className={getFontStyle({ lineHeight: 20, align: 'right' })} />

            <PriceUSDDigits
              className={getFontStyle({ size: 12, lineHeight: 18, color: 'two', align: 'right' })}
              price={record.priceUSD}
              prefix="≈$"
            />
          </div>
        ),
      },
      {
        title: t('ranking24H'),
        width: 92,
        dataIndex: 'pricePercentChange24h',
        key: 'pricePercentChange24h',
        align: 'right',
        sorter: (a: PairItem, b: PairItem) => (a.pricePercentChange24h > b.pricePercentChange24h ? 1 : -1),
        // sortOrder: field === 'pricePercentChange24h' ? order : null,
        render: (change: number) => <FallOrRise num={formatPriceByNumberToFix(change)} />,
      },
      {
        title: t('high24H'),
        width: 120,
        dataIndex: 'priceHigh24h',
        align: 'right',
        key: 'priceHigh24h',
        sorter: (a: PairItem, b: PairItem) => (a.priceHigh24h > b.priceHigh24h ? 1 : -1),
        // sortOrder: field === 'priceHigh24h' ? order : null,
        render: (priceHigh24h: number, record: PairItem) => (
          <div className="price-box">
            <Font align="right" lineHeight={20}>
              {formatPriceChange(priceHigh24h, 4)}
            </Font>

            <PriceUSDDigits
              className={getFontStyle({ size: 12, lineHeight: 18, color: 'two', align: 'right' })}
              price={record.priceHigh24hUSD}
              prefix="≈$"
            />
          </div>
        ),
      },
      {
        title: t('low24H'),
        width: 120,
        dataIndex: 'priceLow24h',
        align: 'right',
        key: 'priceLow24h',
        sorter: (a: PairItem, b: PairItem) => (a.priceLow24h > b.priceLow24h ? 1 : -1),
        // sortOrder: field === 'priceLow24h' ? order : null,
        render: (priceLow24h: number, record: PairItem) => (
          <div className="price-box">
            <Font align="right" lineHeight={20}>
              {formatPriceChange(priceLow24h, 4)}
            </Font>

            <PriceUSDDigits
              className={getFontStyle({ size: 12, lineHeight: 18, color: 'two', align: 'right' })}
              price={record.priceHigh24hUSD}
              prefix="≈$"
            />
          </div>
        ),
      },
      {
        title: t('Vol24H'),
        width: 122,
        dataIndex: 'volume24h',
        align: 'right',
        key: 'volume24h',
        sorter: (a: PairItem, b: PairItem) =>
          new BigNumber(a.volume24h).times(a.priceUSD).gt(new BigNumber(b.volume24h).times(b.priceUSD)) ? 1 : -1,
        // sortOrder: field === 'volume24h' ? order : null,
        render: (volume24h: number, record: PairItem) => (
          <PriceUSDDigits
            className={getFontStyle({ lineHeight: 20 })}
            price={ZERO.plus(volume24h ?? 0).times(record.priceUSD)}
          />
        ),
      },
      {
        title: t('liquidity'),
        width: 120,
        dataIndex: 'tvl',
        align: 'right',
        key: 'tvl',
        sorter: (a: PairItem, b: PairItem) => (a.tvl > b.tvl ? 1 : -1),
        // sortOrder: field === 'tvl' ? order : null,
        render: (tvl: number) => <PriceUSDDigits className={getFontStyle({ lineHeight: 20 })} price={tvl} />,
      },
      {
        title: t('LP7D'),
        width: 142,
        dataIndex: 'feePercent7d',
        align: 'right',
        key: 'feePercent7d',
        sorter: (a: PairItem, b: PairItem) => (a.feePercent7d > b.feePercent7d ? 1 : -1),
        // sortOrder: field === 'feePercent7d' ? order : null,
        render: (feePercent7d: number) => <Font lineHeight={20}>{`${formatPercentage(feePercent7d)}%`}</Font>,
      },
      {
        title: t('operation'),
        dataIndex: 'function',
        align: 'right',
        key: 'function',
        width: 204,
        render: (fnc: string, record: PairItem) => {
          return (
            <Row align="middle" justify="end">
              <Col>
                <SwapBtn token0={record.token0} token1={record.token1} feeRate={record.feeRate} id={record.id} />
              </Col>
              <Col>
                <div className="fill-box" />
              </Col>
              <Col>
                <ManageLiquidityBtn pair={record} />
              </Col>
            </Row>
          );
        },
      },
    ],
    [t],
  );

  const emptyStatus = useMemo(() => {
    if (poolType === 'fav') {
      return {
        type: 'nodata',
        text: t('noFavoritePairs'),
      };
    }
    return {
      type: 'search',
      text: t('noSearch'),
    };
  }, [poolType, t]);

  return (
    <div className="pari-list">
      <CommonTable
        showSorterTooltip={false}
        columns={columns}
        // onChange={getData}
        rowKey="id"
        emptyText={emptyStatus.text}
        emptyType={emptyStatus.type}
        onRow={(record: PairItem) => {
          return {
            onClick: () => callback(record),
          };
        }}
        {...args}
      />
    </div>
  );
}
