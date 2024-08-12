import { memo, useMemo, useState } from 'react';
import { Row } from 'antd';
import { useTranslation } from 'react-i18next';
import Font from 'components/Font';
import CommonCard from 'components/CommonCard';
import SettingFee from 'Buttons/SettingFeeBtn';
import './styles.less';
import { MobileTradePanel, TradePanel } from '../TradePanel';
import clsx from 'clsx';
import { usePairTokens } from 'pages/Exchange/hooks/useSwap';
import { useSelectPair } from 'hooks/swap';
import { SupportedSwapRate, SupportedSwapRateMap } from 'constants/swap';
import { usePair, usePairsAddress } from 'hooks/userPairs';
import { ChainConstants } from 'constants/ChainConstants';
import { useCurrencyBalances } from 'hooks/useBalances';
import { getTokenWeights } from 'utils/token';
import { LimitPanel } from '../LimitPanel';

enum ExchangeSwitchEnum {
  Trade = 1,
  Limit = 2,
}

export default memo(function ExchangePanel() {
  const { t } = useTranslation();
  const [switchValue, setSwitchValue] = useState(ExchangeSwitchEnum.Trade);
  const { tokenA, tokenB, feeRate } = usePairTokens();

  const { leftToken, rightToken } = useSelectPair(tokenA, tokenB);

  const rate = useMemo(() => {
    if (!feeRate) return SupportedSwapRate.percent_0_05;
    return SupportedSwapRateMap[feeRate.toString()] || feeRate.toString();
  }, [feeRate]);

  const pairAddress = usePairsAddress(rate, leftToken, rightToken);

  const routerAddress = ChainConstants.constants.ROUTER[rate];
  const { reserves, getReserves } = usePair(pairAddress, routerAddress);
  const currencyBalances = useCurrencyBalances([leftToken, rightToken]);
  const tokenList = useMemo(() => {
    const leftTokenWeight = getTokenWeights(leftToken?.symbol);
    const rightTokenWeight = getTokenWeights(rightToken?.symbol);
    if (rightTokenWeight > leftTokenWeight) return [leftToken, rightToken];
    return [rightToken, leftToken];
  }, [leftToken, rightToken]);

  return (
    <CommonCard
      className="exchange-panel"
      title={
        <Row justify="space-between" className="exchange-panel-title" align="middle">
          <div className="exchange-panel-switch-area">
            <div
              className={clsx([
                'exchange-panel-switch',
                switchValue === ExchangeSwitchEnum.Trade && 'exchange-panel-switch-active',
              ])}
              onClick={() => setSwitchValue(ExchangeSwitchEnum.Trade)}>
              <Font size={16} weight="bold" lineHeight={24} color="two">
                {t('trade')}
              </Font>
              <div className="exchange-panel-switch-border" />
            </div>
            <div
              className={clsx([
                'exchange-panel-switch',
                switchValue === ExchangeSwitchEnum.Limit && 'exchange-panel-switch-active',
              ])}
              onClick={() => setSwitchValue(ExchangeSwitchEnum.Limit)}>
              <Font size={16} weight="bold" lineHeight={24} color="two">
                {t('Limit')}
              </Font>
              <div className="exchange-panel-switch-border" />
            </div>
          </div>

          <SettingFee />
        </Row>
      }>
      {switchValue === ExchangeSwitchEnum.Trade ? (
        <TradePanel
          rate={rate}
          tokenA={tokenList[0]}
          tokenB={tokenList[1]}
          balances={currencyBalances}
          reserves={reserves}
          getReserves={getReserves}
        />
      ) : (
        <LimitPanel
          rate={rate}
          tokenA={tokenList[0]}
          tokenB={tokenList[1]}
          reserves={reserves}
          balances={currencyBalances}
        />
      )}
    </CommonCard>
  );
});

const MobileExchangePanel = memo(
  ({ sellType }: { sellType?: string }) => {
    const { t } = useTranslation();

    return (
      <CommonCard
        className="exchange-panel-mobile"
        title={
          <Row justify="space-between" className="exchange-panel-title" align="middle">
            <Font size={16} weight="bold" lineHeight={24}>
              {t('trade')}
            </Font>
            <SettingFee />
          </Row>
        }>
        <MobileTradePanel sellType={sellType} />
      </CommonCard>
    );
  },
  (pre, next) => {
    return pre?.sellType === next?.sellType;
  },
);

export { MobileExchangePanel };
