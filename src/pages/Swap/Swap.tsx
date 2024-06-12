import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import SettingFee from 'Buttons/SettingFeeBtn';
import { useHistory } from 'react-router-dom';
import { CommonPanelPage } from 'components/CommonPanelPage';
import { useMobile } from 'utils/isMobile';
import { SwapPanel } from './components/SwapPanel';

import './styles.less';

export const Swap = () => {
  const { t } = useTranslation();
  const isMobile = useMobile();
  const history = useHistory();
  const onCancel = useCallback(() => {
    history.goBack();
  }, [history]);

  return (
    <CommonPanelPage
      className="swap-page"
      onCancel={onCancel}
      title={t('Swap')}
      extraTitle={<SettingFee />}
      isCancelHide={!isMobile}>
      <SwapPanel />
    </CommonPanelPage>
  );
};
