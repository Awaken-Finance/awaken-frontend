import { useTranslation } from 'react-i18next';
import SettingFee from 'Buttons/SettingFeeBtn';
import { CommonPanelPage } from 'components/CommonPanelPage';
import { useIsTelegram, useMobile } from 'utils/isMobile';
import { SwapPanel } from './components/SwapPanel';

import './styles.less';
import { SwapHistory } from './components/SwapHistory';
import { useGoBack } from 'hooks/route';
import { useIsConnected } from 'hooks/useLogin';

export const Swap = () => {
  const { t } = useTranslation();
  const isMobile = useMobile();
  const isTelegram = useIsTelegram();
  const isConnected = useIsConnected();
  const goBack = useGoBack();

  return (
    <>
      <CommonPanelPage
        className="swap-page"
        onCancel={goBack}
        title={t('Swap')}
        extraTitle={<SettingFee />}
        isCancelHide={!isMobile || isTelegram}>
        <SwapPanel />
      </CommonPanelPage>

      {isConnected && <SwapHistory />}
    </>
  );
};
