import CommonModal from 'components/CommonModal';
import { useModal } from 'contexts/useModal';
import { basicModalView } from 'contexts/useModal/actions';
import { useTranslation } from 'react-i18next';
import ExpertMode from './ExpertMode';
import './index.less';
import { useMobile } from 'utils/isMobile';

export default function ExpertModeModal() {
  const { t } = useTranslation();
  const [{ expertModeModal }, { dispatch }] = useModal();
  const isMobile = useMobile();
  const width = isMobile ? '320px' : '420px';
  const onCancel = () => dispatch(basicModalView.setExpertModeModal.actions(false));
  return (
    <CommonModal
      width={width}
      centered={true}
      visible={expertModeModal}
      title={t('ruSure')}
      onCancel={onCancel}
      showBackIcon={false}
      className="expert-modal"
      closable
      showType="modal">
      <ExpertMode onCancel={onCancel} />
    </CommonModal>
  );
}
