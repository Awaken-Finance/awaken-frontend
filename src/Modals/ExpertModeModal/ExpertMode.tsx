import { Row, Col } from 'antd';
import { useUserSettings } from 'contexts/useUserSettings';
import { useTranslation } from 'react-i18next';
import Font from 'components/Font';
import CommonButton from 'components/CommonButton';
import { useMobile } from 'utils/isMobile';
import './index.less';

export default function ExpertMode({ onCancel }: { onCancel: () => void }) {
  const { t } = useTranslation();
  const [, { setIsExpert }] = useUserSettings();
  const isMobile = useMobile();
  return (
    <Row>
      <Col span={24}>
        <Font lineHeight={20} size={14} className="content">
          {!isMobile ? t('expertModeTip1') + t('expertModeTip2') : t('expertModeTip1')}
        </Font>
      </Col>
      {isMobile && (
        <Col span={24}>
          <Font lineHeight={20} size={14}>
            {t('expertModeTip2')}
          </Font>
        </Col>
      )}
      <CommonButton
        style={{ marginTop: '24px' }}
        className="expert-modal-btn"
        type="primary"
        size="middle"
        onClick={() => {
          setIsExpert(true);
          onCancel();
        }}>
        <Font size={16}>{t('startExpertMode')}</Font>
      </CommonButton>
    </Row>
  );
}
