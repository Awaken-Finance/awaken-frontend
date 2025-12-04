import { useModal } from 'contexts/useModal';
import { basicModalView } from 'contexts/useModal/actions';
import CommonModal from '../../components/CommonModal';
import { useTranslation } from 'react-i18next';

import ManageTokens from '../SelectTokenModal/ManageTokens';
import './styles.less';
import { useMemo } from 'react';
import { useMobile } from 'utils/isMobile';
export default function ManageModal() {
  const { t } = useTranslation();
  const [{ manageModal }, { dispatch }] = useModal();
  const isMobile = useMobile();

  const height = useMemo(() => {
    return isMobile ? '540px' : '632px';
  }, [isMobile]);

  return (
    <CommonModal
      width="420px"
      height={height}
      visible={manageModal}
      title={t('tokenLists')}
      className={isMobile ? 'manage-modal-m' : 'manage-modal'}
      onCancel={() => dispatch(basicModalView.setManageModal.actions(false))}>
      <ManageTokens />
    </CommonModal>
  );
}
