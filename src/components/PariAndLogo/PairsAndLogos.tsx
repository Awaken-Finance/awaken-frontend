import { Row, Col } from 'antd';
import { Pairs } from 'components/Pair';
import { CurrencyLogos } from 'components/CurrencyLogo';
import { Currency } from '@awaken/sdk-core';
import { PairsProps } from 'components/Pair/Pairs';

interface PairsAndLogosProps {
  logos: {
    className?: string;
    preview?: boolean;
    size?: number;
    tokens: Array<{
      address?: string;
      src?: string;
      currency?: Currency | null;
      symbol?: string;
    }>;
  };
  pairs: PairsProps;
  gutter?: number | [number, number];
}

export default function PairsAndLogos({ gutter = [4, 8], logos, pairs }: PairsAndLogosProps) {
  return (
    <Row gutter={gutter} align="middle">
      <Col>
        <CurrencyLogos {...logos} />
      </Col>
      <Col>
        <Pairs {...pairs} />
      </Col>
    </Row>
  );
}
