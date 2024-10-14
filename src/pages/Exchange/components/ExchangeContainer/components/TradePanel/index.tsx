import { Col, Row, Tabs } from 'antd';
import CardTabs from 'components/CardTabs';
import clsx from 'clsx';
import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Font from 'components/Font';
import RightCard from '../ExchangeCard/RightCard';
import LeftCard from '../ExchangeCard/LeftCard';
import { Currency } from '@awaken/sdk-core';

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

export type TMobileTradePanelProps = TTradePanelProps & {
  sellType?: string;
};
export const MobileTradePanel = ({
  sellType,
  rate,
  tokenA,
  tokenB,
  balances,
  reserves,
  getReserves,
}: TMobileTradePanelProps) => {
  const { t } = useTranslation();

  const [activeKey, setActiveKey] = useState<string>(sellType || 'buy');

  const switchChange = useCallback(
    (v: string) => {
      if (v === activeKey) {
        return;
      }
      setActiveKey(v);
    },
    [activeKey],
  );

  return (
    <Row className="exchange-panel-mobile-box">
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
              getReserves={getReserves}
              rate={rate}
              tokenA={tokenA}
              tokenB={tokenB}
              reserves={reserves}
              balances={balances}
            />
          </Tabs.TabPane>
          <Tabs.TabPane tab={t('sell')} key="sell">
            <RightCard
              getReserves={getReserves}
              rate={rate}
              tokenA={tokenA}
              tokenB={tokenB}
              reserves={reserves}
              balances={balances}
            />
          </Tabs.TabPane>
        </CardTabs>
      </Col>
    </Row>
  );
};
