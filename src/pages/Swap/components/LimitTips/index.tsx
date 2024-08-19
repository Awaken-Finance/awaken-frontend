import { Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';
import Font from 'components/Font';
import { IconNotificationWarning } from 'assets/icons';
import './styles.less';
import { useMobile } from 'utils/isMobile';

export const LimitTips = () => {
  const { t } = useTranslation();
  const isMobile = useMobile();

  return (
    <Row className="limit-tips" gutter={[8, 0]} wrap={false}>
      <Col>
        <IconNotificationWarning className="limit-tips-icon" />
      </Col>
      <Col>
        <Font size={isMobile ? 12 : 14} lineHeight={isMobile ? 18 : 22} color="two">
          {t('limitTips')}
        </Font>
      </Col>
    </Row>
  );
};
