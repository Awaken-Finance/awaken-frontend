import { useTranslation } from 'react-i18next';
import CreatePair from './CreatePair';
import CommonModal from 'components/CommonModal';
import { useCallback, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import './index.less';
import { useMobile } from 'utils/isMobile';
import { CommonPanelPage } from 'components/CommonPanelPage';

export default function CreatePairPage() {
  const { t } = useTranslation();
  const history = useHistory();
  const isMobile = useMobile();

  const onCancel = useCallback(() => {
    history.goBack();
  }, [history]);

  const height = useMemo(() => {
    if (!isMobile) return '710px';
    return 'calc(100% - 48px)';
  }, [isMobile]);

  return (
    <CommonPanelPage className="create-pair-wrap" title={t('addPairs')} onCancel={onCancel}>
      <CreatePair onCancel={onCancel} />
    </CommonPanelPage>
  );
}
