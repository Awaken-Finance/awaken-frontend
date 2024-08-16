import { memo, useMemo } from 'react';
import { Row, Col } from 'antd';

import { CurrencyLogo } from 'components/CurrencyLogo';
import { unitConverter } from 'utils';
import { useTranslation } from 'react-i18next';
import Font from 'components/Font';
import FallOrRise from 'components/FallOrRise';
import CommonCard from 'components/CommonCard';
import { Pair } from 'components/Pair';

import { useSwapContext } from 'pages/Exchange/hooks/useSwap';
import BigNumber from 'bignumber.js';

import './CapitalPool.less';
import PriceUSDDigits from 'components/PriceUSDDigits';
import getFontStyle from 'utils/getFontStyle';
import { showValueWrapper } from 'utils/price';

function CapitalPool() {
  const { t } = useTranslation();

  const [{ pairInfo }] = useSwapContext();

  const renderContent = useMemo(() => {
    return (
      <Row className="capital-pool-info-content" gutter={[0, 12]}>
        <Col span={24}>
          <Font lineHeight={18} size={12} color="two">
            {t('totalStakedTokens')}
          </Font>
        </Col>
        <Col span={24}>
          <Row align="middle" justify="space-between">
            <Col>
              <Row gutter={[8, 0]} align="middle">
                <Col>
                  <CurrencyLogo size={24} currency={pairInfo?.token0} />
                </Col>
                <Col>
                  <Pair symbol={pairInfo?.token0} size={16} lineHeight={24} />
                </Col>
              </Row>
            </Col>
            <Col>
              <Font size={16}>
                {showValueWrapper(pairInfo?.valueLocked0, unitConverter(pairInfo?.valueLocked0, 2))}
              </Font>
            </Col>
          </Row>
        </Col>
        <Col span={24}>
          <Row align="middle" justify="space-between">
            <Col>
              <Row gutter={[8, 0]} align="middle">
                <Col>
                  <CurrencyLogo size={24} {...pairInfo?.token1} />
                </Col>
                <Col>
                  <Pair symbol={pairInfo?.token1} size={16} lineHeight={24} />
                </Col>
              </Row>
            </Col>
            <Col>
              <Font size={16}>
                {showValueWrapper(pairInfo?.valueLocked1, unitConverter(pairInfo?.valueLocked1, 2))}
              </Font>
            </Col>
          </Row>
        </Col>
        <Col span={24} className="capital-pool-info-content-liquidity">
          <Row>
            <Col span={12}>
              <Row gutter={[0, 4]}>
                <Col span={24}>
                  <Font size={12} lineHeight={18} color="two">
                    {t('marketMakingAccount')}
                  </Font>
                </Col>
                <Col span={24}>
                  <Row gutter={[8, 0]} align="middle">
                    <Col>
                      <PriceUSDDigits
                        className={getFontStyle({ size: 18, lineHeight: 24, weight: 'medium' })}
                        price={pairInfo?.tvl}
                      />
                    </Col>
                    <Col>
                      <FallOrRise
                        size={12}
                        lineHeight={18}
                        num={showValueWrapper(
                          pairInfo?.tvlPercentChange24h,
                          new BigNumber(pairInfo?.tvlPercentChange24h || 0).toFixed(2),
                          null,
                        )}
                      />
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Col>
            <Col span={12}>
              <Row gutter={[0, 4]}>
                <Col span={24}>
                  <Row justify="end">
                    <Font size={12} lineHeight={18} color="two">
                      {t('LP7D')}
                    </Font>
                  </Row>
                </Col>
                <Col span={24}>
                  <Row justify="end">
                    <FallOrRise
                      size={18}
                      lineHeight={24}
                      weight="medium"
                      num={showValueWrapper(
                        pairInfo?.feePercent7d,
                        new BigNumber(pairInfo?.feePercent7d || 0).toFixed(2),
                        null,
                      )}
                    />
                  </Row>
                </Col>
              </Row>
            </Col>
          </Row>
        </Col>
      </Row>
    );
  }, [pairInfo, t]);

  return (
    <CommonCard
      title={
        <Font weight="bold" size={16}>
          {t('liquidityPoolInformation')}
        </Font>
      }
      className="capital-pool-info">
      {renderContent}
    </CommonCard>
  );
}

export default memo(CapitalPool);
