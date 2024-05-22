import { Row, Col } from 'antd';
import { MyTradePair } from 'pages/UserCenter/type';
import { CurrencyLogos } from 'components/CurrencyLogo';
import { Pairs } from 'components/Pair';
import Font from 'components/Font';
import FeeRate from 'components/FeeRate';
import ManageLiquidityBtn from 'Buttons/ManageLiquidityBtn';
import { formatLiquidity, formatPercentage, formatTokenAmount } from 'utils/price';
import CommonList from 'components/CommonList';
import { useTranslation } from 'react-i18next';
import { SortOrder } from 'antd/lib/table/interface';
import { useCallback } from 'react';
import CommonTooltip from 'components/CommonTooltip';

import './index.less';
import PriceUSDDigits from 'components/PriceUSDDigits';
import getFontStyle from 'utils/getFontStyle';
import { formatSymbol } from 'utils/token';

interface ILiquidityItem {
  data: MyTradePair;
}
const LiquidityItem = ({
  data: { tradePair, lpTokenAmount, assetUSD, token0Amount, token1Amount },
}: ILiquidityItem) => {
  const { t } = useTranslation();

  return (
    <Row className="exchange-mobile-list-item">
      <Col span={24}>
        <Row gutter={[8, 0]} justify="space-between" align="top" wrap={false}>
          <Col>
            <Row gutter={[8, 0]} align="top" wrap={false}>
              <Col>
                <CurrencyLogos size={24} tokens={[tradePair.token0, tradePair.token1]} />
              </Col>
              <Col>
                <Pairs tokenA={tradePair?.token0?.symbol} tokenB={tradePair?.token1} lineHeight={20} weight="medium" />
              </Col>
              <Col>
                <FeeRate useBg>{formatPercentage(tradePair?.feeRate * 100)}</FeeRate>
              </Col>
            </Row>
          </Col>
          <Col flex={'auto 0 0'}>
            <Row justify="end" align="middle">
              <Col>
                <ManageLiquidityBtn pair={tradePair} btnText="add" />
              </Col>
              <Col className="table-operate"></Col>
              <Col>
                <ManageLiquidityBtn pair={tradePair} lpType="remove" btnText="remove" />
              </Col>
            </Row>
          </Col>
        </Row>
      </Col>
      <Col span={24} className="balance">
        <Font size={12} lineHeight={18} color="two">
          {t('balance')}
        </Font>
      </Col>
      <Col span={24} className="col-height-20">
        <Font lineHeight={24}>{`${formatLiquidity(lpTokenAmount ?? 0)}`}</Font>
        <PriceUSDDigits prefix=" ≈$" className={getFontStyle({ lineHeight: 24, color: 'two' })} price={assetUSD} />
      </Col>

      <Col span={12} className="amount">
        <Row align="middle">
          <Col>
            <Font size={12} lineHeight={18} color="two">
              {t('amount')}
            </Font>
          </Col>
          <Col style={{ marginLeft: '4px' }}>
            <CommonTooltip title={t('amountTips')} headerDesc={t('amount')} buttonTitle={t('ok')} />
          </Col>
        </Row>
      </Col>
      <Col span={12} className="amount">
        <Row align="middle">
          <Col>
            <Font size={12} lineHeight={18} color="two">
              {t('amount')}
            </Font>
          </Col>
          <Col style={{ marginLeft: '4px' }}>
            <CommonTooltip title={t('amountTips')} headerDesc={t('amount')} buttonTitle={t('ok')} />
          </Col>
        </Row>
      </Col>
      <Col span={12} className="col-height-20">
        <Font lineHeight={20}>{`${formatTokenAmount(token0Amount ?? 0, tradePair.token0.decimals)} ${formatSymbol(
          tradePair.token0.symbol,
        )}`}</Font>
      </Col>
      <Col span={12} className="col-height-20">
        <Font lineHeight={20}>{`${formatTokenAmount(token1Amount ?? 0, tradePair.token1.decimals)} ${formatSymbol(
          tradePair.token1.symbol,
        )}`}</Font>
      </Col>
    </Row>
  );
};

export default function MobileList({
  dataSource = [],
  total,
  loading,
  getData,
  pageNum,
  pageSize,
  field,
  order,
}: {
  dataSource?: MyTradePair[];
  total?: number;
  loading?: boolean;
  getData?: (args: any) => void;
  pageNum?: number;
  pageSize?: number;
  field?: string | null;
  order?: SortOrder | undefined | null;
}) {
  const fetchList = useCallback(
    () => getData && getData({ page: (pageNum ?? 1) + 1, pageSize, field, order }),
    [getData, field, order, pageSize, pageNum],
  );

  return (
    <div className="exchange-mobile-list">
      <CommonList
        dataSource={dataSource}
        renderItem={(item: MyTradePair) => <LiquidityItem data={item} />}
        total={total}
        loading={loading}
        getMore={fetchList}
        pageNum={pageNum}
      />
    </div>
  );
}
