import { Row, Col } from 'antd';
import clsx from 'clsx';
import { useLanguage } from 'i18n';
import { useTranslation } from 'react-i18next';
import { Inputs, Reserves } from 'types/swap';
import Font from 'components/Font';
import { Pairs } from 'components/Pair';
import { Currency } from '@awaken/sdk-core';
import { getEstimatedShare, getPairTokenRatio } from 'utils/swap';
import { useTokens } from 'hooks/swap';
import { unitConverter } from 'utils';
import { getCurrencyAddress } from 'utils/swap';
import { timesDecimals } from 'utils/calculate';
import './index.less';

interface PriceAndLiquidityPoolProps {
  className?: string;
  inputs?: Inputs;
  reserves?: Reserves;
  rightToken?: Currency;
  leftToken?: Currency;
}

const getRatio = (tokenA?: Currency, tokenB?: Currency, reserves?: Reserves, language?: string, inputs?: Inputs) => {
  let tokenReserves = reserves;
  if (!tokenReserves?.[getCurrencyAddress(tokenA)] && !tokenReserves?.[getCurrencyAddress(tokenB)]) {
    tokenReserves = {
      [getCurrencyAddress(tokenA)]: inputs?.[getCurrencyAddress(tokenA)]
        ? timesDecimals(inputs?.[getCurrencyAddress(tokenA)], tokenA?.decimals).toFixed()
        : '0',
      [getCurrencyAddress(tokenB)]: inputs?.[getCurrencyAddress(tokenB)]
        ? timesDecimals(inputs?.[getCurrencyAddress(tokenB)], tokenB?.decimals).toFixed()
        : '0',
    };
  }
  const ratio = getPairTokenRatio({ tokenA, tokenB, reserves: tokenReserves });
  return unitConverter(ratio, 8);
};

export default ({ className = '', inputs, rightToken, leftToken, reserves }: PriceAndLiquidityPoolProps) => {
  const { t } = useTranslation();
  const { language } = useLanguage();

  const tokens = useTokens(leftToken, rightToken);

  if (!leftToken || !rightToken) {
    return null;
  }

  return (
    <Row gutter={[0, 8]} className={clsx('price-and-liquidity-pool', className)}>
      <Col span={24}>
        <Font lineHeight={20} color="two">
          {t('sharePolls')}
        </Font>
      </Col>
      <Col span={8}>
        <Row>
          <Col span={24}>
            <Font weight="medium" lineHeight={20}>
              {getRatio(leftToken, rightToken, reserves, language, inputs)}
            </Font>
          </Col>
          <Col span={24}>
            <Pairs
              size={12}
              lineHeight={18}
              color="three"
              delimiter={t('swapTokenPer')}
              tokenA={rightToken?.symbol}
              tokenB={leftToken?.symbol}
            />
          </Col>
        </Row>
      </Col>
      <Col span={8}>
        <Row justify="center">
          <Col span={24} className="text-align-center">
            <Font weight="medium" lineHeight={20}>
              {getRatio(rightToken, leftToken, reserves, language, inputs)}
            </Font>
          </Col>
          <Col span={24} className="text-align-center">
            <Pairs
              size={12}
              lineHeight={18}
              color="three"
              delimiter={t('swapTokenPer')}
              tokenA={leftToken?.symbol}
              tokenB={rightToken?.symbol}
            />
          </Col>
        </Row>
      </Col>
      <Col span={8}>
        <Row justify="end">
          <Col span={24} className="text-align-right">
            <Font weight="medium" lineHeight={20}>
              {`${getEstimatedShare({ inputs, reserves, tokens })}%`}
            </Font>
          </Col>
          <Col span={24} className="text-align-right">
            <Font size={12} lineHeight={18} color="three">
              {t('amountInLiquidityPool')}
            </Font>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};
