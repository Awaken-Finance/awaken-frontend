import { Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';
import Font from 'components/Font';
import { useMobile } from 'utils/isMobile';
import CommonTooltip from 'components/CommonTooltip';

export const LimitFee = () => {
  const { t } = useTranslation();
  const isMobile = useMobile();

  return (
    <Row justify="space-between">
      <Row gutter={[2, 0]} align="middle">
        <Col>
          <Font size={isMobile ? 12 : 14} lineHeight={isMobile ? 18 : 20} color="two">
            {t('Fee')}
          </Font>
        </Col>
        <Col>
          <CommonTooltip placement="topLeft" title={t('feeDescription')} headerDesc={t('Fee')} buttonTitle={t('ok')} />
        </Col>
      </Row>
      <Col>
        <Row gutter={[2, 0]}>
          <Col>
            <Font size={isMobile ? 12 : 14} lineHeight={isMobile ? 18 : 20} weight="medium">
              {'0'}
            </Font>
          </Col>
          <Col>
            <Font size={isMobile ? 12 : 14} lineHeight={isMobile ? 18 : 20} color="two">
              ELF
            </Font>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};
