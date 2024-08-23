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
import RightCard from '../ExchangeCard/RightCard';
import LeftCard from '../ExchangeCard/LeftCard';
import { Currency } from '@awaken/sdk-core';

import { getTokenWeights } from 'utils/token';
import { CurrencyBalances, Reserves } from 'types/swap';

export type TTradePanelProps = {
  rate: string;
  tokenA?: Currency;
  tokenB?: Currency;
  balances?: CurrencyBalances;
  reserves?: Reserves;
  getReserves: () => void;
};
export const TradePanel = memo(function ({ rate, tokenA, tokenB, balances, reserves, getReserves }: TTradePanelProps) {
  return (
    <Row className="exchange-panel-box" gutter={[32, 0]}>
      <Col span={12}>
        <LeftCard
          getReserves={getReserves}
          rate={rate}
          tokenA={tokenA}
          tokenB={tokenB}
          reserves={reserves}
          balances={balances}
        />
      </Col>
      <Col span={12}>
        <RightCard
          getReserves={getReserves}
          rate={rate}
          tokenA={tokenA}
          tokenB={tokenB}
          reserves={reserves}
          balances={balances}
        />
      </Col>
    </Row>
  );
});

export const MobileTradePanel = memo(
  ({ sellType }: { sellType?: string }) => {
    const { t } = useTranslation();
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

    const [activeKey, setActiveKey] = useState<string>('buy');

    const switchChange = useCallback(
      (v: string) => {
        if (v === activeKey) {
          return;
        }
        setActiveKey(v);
      },
      [activeKey],
    );

    const cardDom = useMemo(() => {
      const leftTokenWeight = getTokenWeights(leftToken?.symbol),
        rightTokenWeight = getTokenWeights(rightToken?.symbol);

      if (rightTokenWeight > leftTokenWeight) {
        return (
          <>
            <Tabs.TabPane tab={t('buy')} key="buy">
              <LeftCard
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
                getReserves={getReserves}
                rate={rate}
                tokenA={leftToken}
                tokenB={rightToken}
                reserves={reserves}
                balances={currencyBalances}
              />
            </Tabs.TabPane>
          </>
        );
      } else {
        return (
          <>
            <Tabs.TabPane tab={t('buy')} key="buy">
              <LeftCard
                getReserves={getReserves}
                rate={rate}
                tokenA={rightToken}
                tokenB={leftToken}
                reserves={reserves}
                balances={currencyBalances}
              />
            </Tabs.TabPane>
            <Tabs.TabPane tab={t('sell')} key="sell">
              <RightCard
                getReserves={getReserves}
                rate={rate}
                tokenA={rightToken}
                tokenB={leftToken}
                reserves={reserves}
                balances={currencyBalances}
              />
            </Tabs.TabPane>
          </>
        );
      }
    }, [currencyBalances, getReserves, leftToken, rate, reserves, rightToken, t]);

    useEffect(() => {
      if (!sellType || sellType === activeKey) {
        return;
      }
      setActiveKey(sellType as string);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sellType]);

    return (
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
            {cardDom}
          </CardTabs>
        </Col>
      </Row>
    );
  },
  (pre, next) => {
    return pre?.sellType === next?.sellType;
  },
);
