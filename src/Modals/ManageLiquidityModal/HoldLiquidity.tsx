import { Currency } from '@awaken/sdk-core';
import { Col, Row } from 'antd';
import Font from 'components/Font';
import { PairAndLogo, PairsAndLogos } from 'components/PariAndLogo';
import BigNumber from 'bignumber.js';
// import { useBalances, useCurrencyBalances } from 'hooks/useBalances';
import { usePairsAddress } from 'hooks/userPairs';
import { useTranslation } from 'react-i18next';
import { unitConverter } from 'utils';
import { divDecimals } from 'utils/calculate';
import { formatLiquidity, formatPercentage, formatPrice } from 'utils/price';
import { getCurrencyAddress, getLPDecimals } from 'utils/swap';
import { ZERO } from 'constants/misc';

import './styles.less';
import useLPBalances from 'hooks/useLPBalances';
import { Reserves } from 'types/swap';
import { useMemo } from 'react';

export default function HoldLiquidity({
  leftToken,
  rightToken,
  rate,
  reserves,
}: {
  leftToken?: Currency;
  rightToken?: Currency;
  rate: string;
  reserves: Reserves | undefined;
}) {
  const { t } = useTranslation();

  const pairAddress = usePairsAddress(rate, leftToken, rightToken);

  const [lpBalance, lp] = useLPBalances(pairAddress, undefined, rate);

  const showLp = divDecimals(lp, getLPDecimals());
  const lpUnit = useMemo(() => {
    const uLP = unitConverter(showLp, 8);
    if (uLP === '0') return '0.00';
    return uLP;
  }, [showLp]);

  const leftLPBalance = useMemo(() => {
    const reserveL = reserves?.[getCurrencyAddress(leftToken)];
    if (!reserveL) {
      return ZERO;
    }
    return divDecimals(lpBalance.times(reserveL), leftToken?.decimals);
  }, [leftToken, lpBalance, reserves]);

  const rightLPBalance = useMemo(() => {
    const reserveR = reserves?.[getCurrencyAddress(rightToken)];
    if (!reserveR) {
      return ZERO;
    }
    return divDecimals(lpBalance.times(reserveR), rightToken?.decimals);
  }, [lpBalance, reserves, rightToken]);

  if (showLp.isEqualTo(ZERO)) {
    return null;
  }

  return (
    <Col span={24}>
      <Row gutter={[0, 12]}>
        <Col span={24}>
          <Row justify="space-between">
            <Col>
              <Row gutter={[8, 0]}>
                <Col>
                  <PairsAndLogos
                    gutter={[8, 0]}
                    logos={{ size: 24, tokens: [{ currency: leftToken }, { currency: rightToken }] }}
                    pairs={{
                      tokenA: leftToken?.symbol,
                      tokenB: rightToken?.symbol,
                      lineHeight: 24,
                      size: 16,
                      weight: 'medium',
                    }}
                  />
                </Col>
                <Col>
                  <Font lineHeight={24} size={16} weight="medium">
                    {t('lp')}
                  </Font>
                </Col>
              </Row>
            </Col>
            <Col>
              <Font lineHeight={24} size={16} weight="medium">
                {lpUnit}
              </Font>
            </Col>
          </Row>
        </Col>
        <Col className="add-modal-box-lp" span={24}>
          <Row gutter={[0, 12]} align="middle">
            <Col span={24}>
              <Row justify="space-between" align="middle">
                <Col>
                  <PairAndLogo
                    gutter={[8, 0]}
                    logo={{ size: 24, currency: leftToken }}
                    pair={{ symbol: leftToken?.symbol, lineHeight: 20, weight: 'medium' }}
                  />
                </Col>
                <Col>
                  <Font lineHeight={24} size={16} weight="medium">
                    {formatLiquidity(leftLPBalance, leftToken?.decimals)}
                  </Font>
                </Col>
              </Row>
            </Col>
            <Col span={24}>
              <Row justify="space-between" align="middle">
                <Col>
                  <PairAndLogo
                    gutter={[8, 0]}
                    logo={{ size: 24, currency: rightToken }}
                    pair={{ symbol: rightToken?.symbol, lineHeight: 20, weight: 'medium' }}
                  />
                </Col>
                <Col>
                  <Font lineHeight={24} size={16} weight="medium">
                    {formatLiquidity(rightLPBalance, rightToken?.decimals)}
                  </Font>
                </Col>
              </Row>
            </Col>
            <Col span={24}>
              <Row justify="space-between" align="middle">
                <Col>
                  <Font lineHeight={20} color="two">
                    {t('feeTier')}
                  </Font>
                </Col>
                <Col>
                  <Font lineHeight={20} weight="medium">{`${formatPercentage(new BigNumber(rate))}%`}</Font>
                </Col>
              </Row>
            </Col>
          </Row>
        </Col>
      </Row>
    </Col>
  );
}
