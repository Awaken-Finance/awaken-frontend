import { Currency } from '@awaken/sdk-core';
import { Col, Row } from 'antd';
import { CurrencyLogo } from 'components/CurrencyLogo';
import Font from 'components/Font';
import { Pair } from 'components/Pair';
import { getELFChainTokenURL } from 'utils';
import { formatLiquidity } from 'utils/price';

export default function CurrencyRow({ token, value }: { token: Currency; value: string }) {
  return (
    <Row gutter={[2, 0]} align="middle">
      <Col flex={'25px'}>
        <CurrencyLogo symbol={token?.symbol} src={getELFChainTokenURL(token?.symbol)} />
      </Col>
      <Col flex={1}>
        <Pair symbol={token?.symbol} />
      </Col>
      <Col>
        <Font lineHeight={20} weight="medium">
          {formatLiquidity(value, token.decimals)}
        </Font>
      </Col>
      <Col>
        <Pair symbol={token?.symbol} color="two" />
      </Col>
    </Row>
  );
}
