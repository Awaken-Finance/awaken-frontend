import { useTranslation } from 'react-i18next';
import CreatePair from './CreatePair';
import { useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import './index.less';
import { CommonPanelPage } from 'components/CommonPanelPage';

export default function CreatePairPage() {
  const { t } = useTranslation();
  const history = useHistory();

  const onCancel = useCallback(() => {
    history.goBack();
  }, [history]);

  return (
    <CommonPanelPage className="create-pair-wrap" title={t('addPairs')} onCancel={onCancel}>
      <CreatePair onCancel={onCancel} />
    </CommonPanelPage>
  );
}
