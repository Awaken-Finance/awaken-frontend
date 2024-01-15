import { useMemo } from 'react';
import { Row, Col } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import BigNumber from 'bignumber.js';
import { useTranslation } from 'react-i18next';

import CreatePairBtn from 'Buttons/CreatePairBtn';
import { CollectionBtnInList } from 'Buttons/CollectionBtn';
import TradingMeunList from 'components/TradingMeunList';
import Font from 'components/Font';
import { Pairs } from 'components/Pair';
import FeeRate from 'components/FeeRate';
import FallOrRise from 'components/FallOrRise';
import { useGoSwapPage } from 'Buttons/SwapBtn';
import { SortOrder } from 'antd/lib/table/interface';
import { formatPercentage, formatPriceByNumberToFix, formatPriceUSDWithSymBol } from 'utils/price';
import SearchTairByName from 'components/SearchTairByName';
import ScrollTableList from 'components/CommonTable/ScrollTableList';
import { PairItem } from 'types';
import { FetchParam } from 'types/requeset';

import './index.less';

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
        width: '50%',
        align: 'left',
        render: (id: string, pairData: PairItem) => (
          <Row wrap={false}>
            <Col className="mobile-pari-list-collect">
              <CollectionBtnInList favId={pairData?.favId} id={pairData?.id} isFav={pairData.isFav} />
            </Col>
            <Col flex={1}>
              <Row gutter={[8, 0]} align="middle">
                <Col>
                  <Pairs tokenA={pairData.token0} tokenB={pairData.token1} />
                </Col>
                <Col>
                  <FeeRate useBg>{formatPercentage(pairData?.feeRate * 100)}</FeeRate>
                </Col>
                <Col span={24}>
                  <Font lineHeight={18} size={12} color="two">
                    {formatPriceUSDWithSymBol(pairData?.volume24h, 'Vol ')}
                  </Font>
                </Col>
              </Row>
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
        sorter: true,
        sortOrder: field === 'pricePercentChange24h' ? order : null,
        render: (val: number, record: PairItem) => (
          <Row justify="end">
            <Col span={24}>
              <Font lineHeight={20}>{`$${new BigNumber(record.price).toFormat(2)}`}</Font>
            </Col>
            <Col>
              <FallOrRise lineHeight={18} className="fail-or-rise" num={formatPriceByNumberToFix(val)} />
            </Col>
          </Row>
        ),
      },
    ];
  }, [t, field, order]);

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
        <TradingMeunList onChange={getData} className="mobile-pari-list-menu" source="market" />
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
          onChange={getData}
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
