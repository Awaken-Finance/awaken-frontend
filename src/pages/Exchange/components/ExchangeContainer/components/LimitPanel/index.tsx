import { Col, Row } from 'antd';
import { memo } from 'react';

import { Currency } from '@awaken/sdk-core';

import { CurrencyBalances, Reserves } from 'types/swap';
import { LimitLeftCard } from '../LimitCard/LimitLeftCard';
import { LimitRightCard } from '../LimitCard/LimitRightCard';

export type TLimitPanelProps = {
  rate: string;
  tokenA?: Currency;
  tokenB?: Currency;
  balances?: CurrencyBalances;
  reserves?: Reserves;
};
export const LimitPanel = memo(function ({ rate, tokenA, tokenB, balances, reserves }: TLimitPanelProps) {
  return (
    <Row className="exchange-panel-box" gutter={[32, 0]}>
      <Col span={12}>
        <LimitLeftCard rate={rate} tokenA={tokenA} tokenB={tokenB} reserves={reserves} balances={balances} />
      </Col>
      <Col span={12}>
        <LimitRightCard rate={rate} tokenA={tokenA} tokenB={tokenB} reserves={reserves} balances={balances} />
      </Col>
    </Row>
  );
});
