import { useModal } from 'contexts/useModal';
import { basicModalView } from 'contexts/useModal/actions';
import { Row } from 'antd';
import CommonButton from 'components/CommonButton';
import CommonModal from 'components/CommonModal';
import Font from 'components/Font';
import { useTranslation } from 'react-i18next';
import { useMobile } from 'utils/isMobile';
import './styles.less';

export default function SynchronizedAccountInfoModal() {
  const [{ synchronizedAccountInfoModal }, { dispatch }] = useModal();

  const { t } = useTranslation();

  const isMobile = useMobile();

  const onCancel = () => dispatch(basicModalView.setSynchronizedAccountInfoModal.actions(false));
  return (
    <CommonModal
      visible={synchronizedAccountInfoModal}
      className={isMobile ? 'synchronized-acccount-modal-m' : 'synchronized-acccount-modal'}
      width={isMobile ? '320px' : '420px'}
      showType="modal"
      showBackIcon={false}>
      <Row justify="center">
        <Font size={14} lineHeight={20} color="one">
          {t('SynchronizingDesc')}
        </Font>
      </Row>
      <Row>
        <CommonButton
          type="primary"
          size={isMobile ? 'middle' : 'large'}
          onClick={onCancel}
          block
          className="common-btn">
          {t('ok')}
        </CommonButton>
      </Row>
    </CommonModal>
  );
}
