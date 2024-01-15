import { Row, Col } from 'antd';
import { MyTradePair } from 'pages/UserCenter/type';
import { CurrencyLogos } from 'components/CurrencyLogo';
import { Pairs } from 'components/Pair';
import Font from 'components/Font';
import FeeRate from 'components/FeeRate';
import ManageLiquidityBtn from 'Buttons/ManageLiquidityBtn';
import { formatLiquidity, formatPercentage, formatPriceChange, formatPriceUSDWithSymBol } from 'utils/price';
import CommonList from 'components/CommonList';
import { useTranslation } from 'react-i18next';
import { SortOrder } from 'antd/lib/table/interface';
import { useCallback } from 'react';
import CommonTooltip from 'components/CommonTooltip';

import './index.less';

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
  const { t } = useTranslation();

  const fetchList = useCallback(
    () => getData && getData({ page: (pageNum ?? 1) + 1, pageSize, field, order }),
    [getData, field, order, pageSize, pageNum],
  );

  return (
    <div className="exchange-mobile-list">
      <CommonList
        dataSource={dataSource}
        renderItem={({ tradePair, lpTokenAmount, assetUSD, token0Amount, token1Amount }: MyTradePair) => (
          <Row className="exchange-mobile-list-item">
            <Col span={24}>
              <Row justify="space-between" align="middle">
                <Col>
                  <Row gutter={[8, 0]} align="middle">
                    <Col>
                      <CurrencyLogos size={24} tokens={[tradePair.token0, tradePair.token1]} />
                    </Col>
                    <Col>
                      <Pairs
                        tokenA={tradePair?.token0?.symbol}
                        tokenB={tradePair?.token1}
                        lineHeight={24}
                        weight="medium"
                      />
                    </Col>
                    <Col>
                      <FeeRate useBg>{formatPercentage(tradePair?.feeRate * 100)}</FeeRate>
                    </Col>
                  </Row>
                </Col>
                <Col>
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
              <Font lineHeight={24} color="two">
                {formatPriceUSDWithSymBol(assetUSD, '≈')}
              </Font>
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
              <Font lineHeight={20}>{`${formatPriceChange(token0Amount ?? 0)} ${tradePair.token0.symbol}`}</Font>
            </Col>
            <Col span={12} className="col-height-20">
              <Font lineHeight={20}>{`${formatPriceChange(token1Amount ?? 0)} ${tradePair.token1.symbol}`}</Font>
            </Col>
          </Row>
        )}
        total={total}
        loading={loading}
        getMore={fetchList}
        pageNum={pageNum}
      />
    </div>
  );
}
