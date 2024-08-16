import { Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';
import Font from 'components/Font';
import { useMobile } from 'utils/isMobile';
import CommonTooltip from 'components/CommonTooltip';
import { useMemo } from 'react';
import { FontSize, LineHeight } from 'utils/getFontStyle';

export const LimitFee = () => {
  const { t } = useTranslation();
  const isMobile = useMobile();

  const lineHeight = useMemo<LineHeight>(() => (isMobile ? 18 : 22), [isMobile]);
  const fontSize = useMemo<FontSize>(() => (isMobile ? 12 : 14), [isMobile]);

  return (
    <Row justify="space-between">
      <Row gutter={[2, 0]} align="middle">
        <Col>
          <Font size={fontSize} lineHeight={lineHeight} color="two">
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
            <Font size={fontSize} lineHeight={lineHeight} weight="medium">
              {'0'}
            </Font>
          </Col>
          <Col>
            <Font size={fontSize} lineHeight={lineHeight} color="two">
              ELF
            </Font>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};
