import { Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';
import CommonTooltip from 'components/CommonTooltip';

import Font from 'components/Font';

export default function Amount({ value }: { value?: string }) {
  const { t } = useTranslation();
  return (
    <Row justify="end">
      <Col>
        <Font lineHeight={18} size={12} color="two">
          {value}
        </Font>
      </Col>
      <Col style={{ marginLeft: '4px' }}>
        <CommonTooltip title={t('amountTips')} />
      </Col>
    </Row>
  );
}
