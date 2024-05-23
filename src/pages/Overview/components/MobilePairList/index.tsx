import { useMemo } from 'react';
import { Row, Col } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { useTranslation } from 'react-i18next';

import CreatePairBtn from 'Buttons/CreatePairBtn';
import { CollectionBtnInList } from 'Buttons/CollectionBtn';
import TradingMenuList from 'components/TradingMenuList';
import Font from 'components/Font';
import { Pairs } from 'components/Pair';
import FeeRate from 'components/FeeRate';
import FallOrRise from 'components/FallOrRise';
import { useGoSwapPage } from 'Buttons/SwapBtn';
import { SortOrder } from 'antd/lib/table/interface';
import { formatPercentage, formatPriceByNumberToFix } from 'utils/price';
import SearchTairByName from 'components/SearchTairByName';
import ScrollTableList from 'components/CommonTable/ScrollTableList';
import { PairItem } from 'types';
import { FetchParam } from 'types/requeset';

import './index.less';
import BigNumber from 'bignumber.js';
import PriceDigits from 'components/PriceDigits';
import getFontStyle from 'utils/getFontStyle';
import PriceUSDDigits from 'components/PriceUSDDigits';

export default function MobilePairList({
  dataSource = [],
  loading,
  total,
  getData = () => null,
  pageSize,
  pageNum,
  field,
  order,
  searchVal,
}: {
  dataSource?: PairItem[];
  loading?: boolean;
  total?: number;
  field?: string | null;
  order?: SortOrder;
  pageSize?: number;
  pageNum?: number;
  searchVal?: string;

  getData?: (params: FetchParam) => void;
}) {
  const { t } = useTranslation();

  const callback = useGoSwapPage();

  const columns = useMemo<ColumnsType<PairItem>>(() => {
    return [
      {
        title: t('pair/24hVol'),
        dataIndex: 'priceUSD',
        key: 'priceUSD',
        width: '60%',
        align: 'left',
        render: (id: string, pairData: PairItem) => (
          <Row wrap={false}>
            <Col className="mobile-pari-list-collect">
              <CollectionBtnInList favId={pairData?.favId} id={pairData?.id} isFav={pairData.isFav} />
            </Col>
            <Col flex={1}>
              <Row gutter={[8, 0]} align="top" wrap={false}>
                <Col>
                  <Pairs tokenA={pairData.token0} tokenB={pairData.token1} />
                </Col>
                <Col>
                  <FeeRate useBg>{formatPercentage(pairData?.feeRate * 100)}</FeeRate>
                </Col>
              </Row>
              <Col span={24}>
                <PriceUSDDigits
                  className={getFontStyle({ size: 12, lineHeight: 18, color: 'two' })}
                  price={new BigNumber(pairData?.volume24h).times(pairData.priceUSD)}
                  prefix="Vol $"
                />
              </Col>
            </Col>
          </Row>
        ),
      },
      {
        title: t('price/24hChange'),
        dataIndex: 'pricePercentChange24h',
        key: 'pricePercentChange24h',
        align: 'right',
        width: '50%',
        sorter: (a: PairItem, b: PairItem) => (a.pricePercentChange24h > b.pricePercentChange24h ? 1 : -1),
        // sortOrder: field === 'pricePercentChange24h' ? order : null,
        render: (val: number, record: PairItem) => (
          <Row justify="end">
            <Col span={24}>
              <PriceDigits className={getFontStyle({ lineHeight: 20 })} price={record.price} />
            </Col>
            <Col>
              <FallOrRise lineHeight={18} className="fail-or-rise" num={formatPriceByNumberToFix(val)} />
            </Col>
          </Row>
        ),
      },
    ];
  }, [t]);

  return (
    <Row className="mobile-pari-list">
      <Col span={24} className="mobile-pari-list-top">
        <Row justify="space-between">
          <Col className="mobile-pari-list-title">
            <Font lineHeight={30} size={20} weight="medium" align="center">
              {t('market')}
            </Font>
          </Col>
          <Col className="mobile-pari-list-btn">
            <CreatePairBtn useBtn size="small" />
          </Col>
        </Row>
      </Col>
      <Col span={24} className="mobile-pari-list-search">
        <SearchTairByName
          value={searchVal}
          onChange={(searchVal) => getData({ searchVal })}
          className="mobile-pari-list-search-input"
        />
      </Col>
      <Col span={24} className="mobile-pari-list-menu-box">
        <TradingMenuList onChange={getData} className="mobile-pari-list-menu" source="market" />
      </Col>
      <Col span={24}>
        <ScrollTableList
          total={total}
          loading={loading}
          dataSource={dataSource}
          showSorterTooltip={false}
          columns={columns}
          rowKey="id"
          pageSize={pageSize}
          pageNum={pageNum}
          order={order}
          field={field}
          // onChange={getData}
          onRow={(record: PairItem) => {
            return {
              onClick: () => callback(record),
            };
          }}
        />
      </Col>
    </Row>
  );
}
