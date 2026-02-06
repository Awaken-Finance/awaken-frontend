import { ComponentStyle, ETransferLayoutProvider, ETransferStyleProvider, History } from '@etransfer/ui-react';
import './styles.less';
import { useIsTelegram, useMobile } from 'utils/isMobile';
import CommonButton from 'components/CommonButton';
import { useHistory } from 'react-router-dom';
import { useCallback } from 'react';
import { IconArrowLeft } from 'assets/icons';
import Font from 'components/Font';
import { useTranslation } from 'react-i18next';
import '@etransfer/ui-react/dist/assets/index.css';
import { useETransferAuthToken } from 'hooks/useETransferAuthToken';
import { useEffectOnce } from 'react-use';

export default () => {
  const { t } = useTranslation();
  const isMobile = useMobile();
  // const isTelegram = useIsTelegram();

  const history = useHistory();
  const onBack = useCallback(() => {
    history.goBack();
  }, [history]);

  const { getAuthToken } = useETransferAuthToken();
  useEffectOnce(() => {
    console.log('effect init');
    getAuthToken();
  });

  return (
    <div className="deposit-history-page">
      <div className="deposit-history-page-header">
        <CommonButton className="deposit-history-page-back-btn" type="text" icon={<IconArrowLeft />} onClick={onBack} />
        <Font weight="bold" lineHeight={isMobile ? 24 : 32} size={isMobile ? 16 : 24}>
          {t('History')}
        </Font>
      </div>

      <ETransferStyleProvider>
        <ETransferLayoutProvider>
          <History componentStyle={isMobile ? ComponentStyle.Mobile : ComponentStyle.Web} isUnreadHistory={false} />
        </ETransferLayoutProvider>
      </ETransferStyleProvider>
    </div>
  );
};
