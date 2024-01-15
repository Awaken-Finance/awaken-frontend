import { useModal } from 'contexts/useModal';
import { basicModalView } from 'contexts/useModal/actions';
import CommonModal from '../../components/CommonModal';
import CreatePair from '../../pages/CreatePair/CreatePair';
import { useTranslation } from 'react-i18next';
import useOnLogin from 'hooks/useOnLogin';
import { useCallback } from 'react';

export default function CreatePairModal() {
  const { t } = useTranslation();
  const [{ createPairModal }, { dispatch }] = useModal();
  const onCancel = useCallback(() => dispatch(basicModalView.setCreatePairModal.actions(false)), [dispatch]);

  useOnLogin(onCancel);

  return (
    <CommonModal visible={createPairModal} title={t('addPairsModal')} onCancel={onCancel}>
      <CreatePair onCancel={onCancel} />
    </CommonModal>
  );
}
