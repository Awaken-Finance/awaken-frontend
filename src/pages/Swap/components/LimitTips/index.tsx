import { Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';
import Font from 'components/Font';
import { IconNotificationWarning } from 'assets/icons';
import './styles.less';

export const LimitTips = () => {
  const { t } = useTranslation();

  return (
    <Row className="limit-tips" gutter={[8, 0]} wrap={false}>
      <Col>
        <IconNotificationWarning className="limit-tips-icon" />
      </Col>
      <Col>
        <Font size={14} lineHeight={22} color="two">
          {t('Limits may not be executed exactly when tokens reach the specified price.')}
        </Font>
      </Col>
    </Row>
  );
};
