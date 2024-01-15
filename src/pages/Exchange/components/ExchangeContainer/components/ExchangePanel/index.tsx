import { Col, Row, Tabs } from 'antd';
import CardTabs from 'components/CardTabs';
import clsx from 'clsx';

import { SupportedSwapRate, SupportedSwapRateMap } from 'constants/swap';
import { useSelectPair } from 'hooks/swap';
import { useCurrencyBalances } from 'hooks/useBalances';
import { usePair, usePairsAddress } from 'hooks/userPairs';
import { usePairTokens } from 'pages/Exchange/hooks/useSwap';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChainConstants } from 'constants/ChainConstants';

import Font from 'components/Font';
import CommonCard from 'components/CommonCard';
import SettingFee from 'Buttons/SettingFeeBtn';
import RightCard from '../ExchangeCard/RightCard';
import LeftCard from '../ExchangeCard/LeftCard';

import './styles.less';

export default memo(function ExchangePanel() {
  const { t } = useTranslation();
  const { tokenA, tokenB, feeRate } = usePairTokens();

  const { leftToken, rightToken, setRightToken, setLeftToken } = useSelectPair(tokenA, tokenB);

  const rate = useMemo(() => {
    if (!feeRate) return SupportedSwapRate.percent_0_05;
    return SupportedSwapRateMap[feeRate.toString()] || feeRate.toString();
  }, [feeRate]);

  const pairAddress = usePairsAddress(rate, leftToken, rightToken);

  const routerAddress = ChainConstants.constants.ROUTER[rate];
  const { reserves, getReserves } = usePair(pairAddress, routerAddress);

  const currencyBalances = useCurrencyBalances([leftToken, rightToken]);

  return (
    <CommonCard
      className="exchange-panel"
      title={
        <Row justify="space-between" className="exchange-panel-title" align="middle">
          <Font size={16} weight="bold" lineHeight={24}>
            {t('trade')}
          </Font>
          <SettingFee />
        </Row>
      }>
      <Row className="exchange-panel-box" gutter={[32, 0]}>
        <Col span={12}>
          <LeftCard
            setToken={setLeftToken}
            getReserves={getReserves}
            rate={rate}
            tokenA={leftToken}
            tokenB={rightToken}
            reserves={reserves}
            balances={currencyBalances}
          />
        </Col>
        <Col span={12}>
          <RightCard
            setToken={setRightToken}
            getReserves={getReserves}
            rate={rate}
            tokenA={leftToken}
            tokenB={rightToken}
            reserves={reserves}
            balances={currencyBalances}
          />
        </Col>
      </Row>
    </CommonCard>
  );
});

const MobileExchangePanel = memo(
  ({ sellType }: { sellType?: string }) => {
    const { t } = useTranslation();
    const { tokenA, tokenB, feeRate } = usePairTokens();
    const { leftToken, rightToken, setRightToken, setLeftToken } = useSelectPair(tokenA, tokenB);

    const rate = useMemo(() => {
      if (!feeRate) return SupportedSwapRate.percent_0_05;
      return SupportedSwapRateMap[feeRate.toString()] || feeRate.toString();
    }, [feeRate]);

    const pairAddress = usePairsAddress(rate, leftToken, rightToken);
    const routerAddress = ChainConstants.constants.ROUTER[rate];
    const { reserves, getReserves } = usePair(pairAddress, routerAddress);
    const currencyBalances = useCurrencyBalances([leftToken, rightToken]);

    const [activeKey, setActiveKey] = useState<string>('buy');

    const switchChange = useCallback(
      (v) => {
        if (v === activeKey) {
          return;
        }
        setActiveKey(v);
      },
      [activeKey],
    );

    useEffect(() => {
      if (!sellType || sellType === activeKey) {
        return;
      }
      setActiveKey(sellType as string);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sellType]);

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
        <Row gutter={[0, 16]} className="exchange-panel-mobile-box">
          <Col span={24}>
            <Row className="switch-btn">
              <Col
                span={12}
                className={clsx('switch-btn-item', activeKey === 'buy' && 'active')}
                onClick={() => switchChange('buy')}>
                <Font size={16} color={activeKey === 'buy' ? 'one' : 'two'}>
                  {t('buy')}
                </Font>
              </Col>
              <Col
                span={12}
                className={clsx('switch-btn-item', activeKey === 'sell' && 'active')}
                onClick={() => switchChange('sell')}>
                <Font size={16} color={activeKey === 'sell' ? 'one' : 'two'}>
                  {t('sell')}
                </Font>
              </Col>
            </Row>
          </Col>
          <Col span={24} className="exchange-card">
            <CardTabs activeKey={activeKey} renderTabBar={() => <div />}>
              <Tabs.TabPane tab={t('buy')} key="buy">
                <LeftCard
                  setToken={setLeftToken}
                  getReserves={getReserves}
                  rate={rate}
                  tokenA={leftToken}
                  tokenB={rightToken}
                  reserves={reserves}
                  balances={currencyBalances}
                />
              </Tabs.TabPane>
              <Tabs.TabPane tab={t('sell')} key="sell">
                <RightCard
                  setToken={setRightToken}
                  getReserves={getReserves}
                  rate={rate}
                  tokenA={leftToken}
                  tokenB={rightToken}
                  reserves={reserves}
                  balances={currencyBalances}
                />
              </Tabs.TabPane>
            </CardTabs>
          </Col>
        </Row>
      </CommonCard>
    );
  },
  (pre, next) => {
    return pre?.sellType === next?.sellType;
  },
);

export { MobileExchangePanel };
