import { useTranslation } from 'react-i18next';
import CreatePair from './CreatePair';
import CommonModal from 'components/CommonModal';
import { useCallback, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import './index.less';
import { useMobile } from 'utils/isMobile';

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
    <CommonModal
      wrapClassName="create-pair-wrap"
      className="create-pair-wrap"
      visible={true}
      closable={false}
      keyboard={false}
      mask={false}
      transitionName="custom"
      title={t('addPairs')}
      size="large"
      width={isMobile ? '100%' : '480px'}
      height={height}
      onCancel={onCancel}>
      <CreatePair onCancel={onCancel} />
    </CommonModal>
  );
}
