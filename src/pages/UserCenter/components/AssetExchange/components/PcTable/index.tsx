import { useMemo } from 'react';
import { Row, Col } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { useTranslation } from 'react-i18next';

import { MyTradePair, TradePair } from 'pages/UserCenter/type';
import { CommonTable } from 'components/CommonTable';
import Font from 'components/Font';
import { CurrencyLogos } from 'components/CurrencyLogo';
import { Pairs } from 'components/Pair';
import FeeRate from 'components/FeeRate';
import { formatPercentage, formatPriceChange, formatPriceUSDWithSymBol } from 'utils/price';
import ManageLiquidityBtn from 'Buttons/ManageLiquidityBtn';
import { SortOrder } from 'antd/lib/table/interface';
import Amount from '../Amount';

import './index.less';

export default function PcTable({
  dataSource,
  total,
  loading,
  getData,
  pageSize,
  pageNum,
  field,
  order,
}: {
  dataSource?: MyTradePair[];
  total?: number;
  loading?: boolean;
  getData?: (args: any) => void;
  pageSize?: number;
  pageNum?: number;
  field?: string | null;
  order?: SortOrder;
}) {
  const { t } = useTranslation();

  const columns = useMemo<ColumnsType<MyTradePair>>(() => {
    return [
      {
        title: t('lp'),
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
        title: t('balance'),
        key: 'lpTokenAmount',
        dataIndex: 'lpTokenAmount',
        sorter: true,
        sortOrder: field === 'lpTokenAmount' ? order : null,
        align: 'right',
        render: (val: number) => <Font lineHeight={24}>{`${formatPriceChange(val)} LP`}</Font>,
      },
      {
        title: t('Value'),
        key: 'assetUSD',
        dataIndex: 'assetUSD',
        sorter: true,
        sortOrder: field === 'assetUSD' ? order : null,
        align: 'right',
        render: (val: number) => <Font lineHeight={24}>{formatPriceUSDWithSymBol(val)}</Font>,
      },
      {
        title: <Amount value={t('amount')}></Amount>,
        key: 'token0Amount',
        dataIndex: 'token0Amount',
        align: 'right',
        render: (val: number, record) => (
          <Font lineHeight={24}>{`${formatPriceChange(val)} ${record.tradePair.token0.symbol}`}</Font>
        ),
      },
      {
        title: <Amount value={t('amount')}></Amount>,
        key: 'token1Amount',
        dataIndex: 'token1Amount',
        align: 'right',
        render: (val: number, record) => (
          <Font lineHeight={24}>{`${formatPriceChange(val)} ${record.tradePair.token1.symbol}`}</Font>
        ),
      },
      {
        title: t('operation'),
        dataIndex: 'operation',
        align: 'right',
        key: 'function',
        render: (fnc: string, record: MyTradePair) => (
          <Row justify="end" align="middle">
            <Col>
              <ManageLiquidityBtn pair={record.tradePair} />
            </Col>
            <Col className="table-operate"></Col>
            <Col>
              <ManageLiquidityBtn pair={record.tradePair} lpType="remove" btnText="removeLiquidityBtn" />
            </Col>
          </Row>
        ),
      },
    ];
  }, [t, field, order]);

  return (
    <Row className="pc-table">
      <Col span={24} className="pc-table-header">
        <Font weight="bold" lineHeight={48} size={32}>
          {t('myMarketingMakingLiquidity')}
        </Font>
      </Col>
      <Col span={24} className="pc-table-box">
        <CommonTable
          onChange={getData}
          total={total}
          loading={loading}
          dataSource={dataSource}
          columns={columns}
          rowKey={(record) => record.tradePair.id}
          pageSize={pageSize}
          pageNum={pageNum}
          emptyType="nodata"
          className="exchange-table"
        />
      </Col>
    </Row>
  );
}
