import { Col, Row } from 'antd';
import { useTranslation } from 'react-i18next';

import Font from 'components/Font';

function TotalAmount({ value = 0, symbol = '' }: { value?: string | number; symbol?: string }) {
  const { t } = useTranslation();
  return (
    <Row className="item-row" justify="space-between" align="middle">
      <Col>
        <Font color="two" lineHeight={24}>
          {t('total')}
        </Font>
      </Col>
      <Col className="panel-balance">
        <Row gutter={[8, 0]} align="middle">
          <Col>
            <Font size={16} lineHeight={24} weight="medium" color="two">
              {value}
            </Font>
          </Col>
          <Col>
            <Font color="two" lineHeight={24}>
              {symbol}
            </Font>
          </Col>
        </Row>
      </Col>
    </Row>
  );
}

export default TotalAmount;
