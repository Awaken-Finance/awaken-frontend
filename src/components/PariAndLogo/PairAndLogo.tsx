import { Row, Col } from 'antd';
import { Pair } from 'components/Pair';
import { CurrencyLogo } from 'components/CurrencyLogo';
import { Currency } from '@awaken/sdk-core';
import { PairProps } from 'components/Pair/Pair';

interface PairAndLogoProp {
  logo: {
    currency?: Currency | null;
    address?: string;
    size?: number;
    symbol?: string;
  };
  pair: PairProps;
  gutter?: number | [number, number];
}

export default function PairsAndLogo({ gutter = [4, 8], logo, pair }: PairAndLogoProp) {
  return (
    <Row gutter={gutter} align="middle">
      <Col>
        <CurrencyLogo {...logo} />
      </Col>
      <Col>
        <Pair {...pair} />
      </Col>
    </Row>
  );
}
