import { forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import CommonModal from 'components/CommonModal';
import {
  ComponentStyle,
  Deposit,
  ETransferConfig,
  ETransferDepositProvider,
  ETransferLayoutProvider,
  ETransferStyleProvider,
} from '@etransfer/ui-react';
import { useMobile } from 'utils/isMobile';
import '@etransfer/ui-react/dist/assets/index.css';
import { ETRANSFER_DEPOSIT_CONFIG, ETRANSFER_DEPOSIT_DEFAULT_NETWORK } from 'config/etransferConfig';
import { DEFAULT_CHAIN } from 'constants/index';
import { useEffectOnce } from 'react-use';
import { useETransferAuthToken } from 'hooks/useETransferAuthToken';
import './styles.less';
import 'pages/Deposit/styles.less';
import { DEPOSIT_RECEIVE_SUPPORT_DEPOSIT_TOKENS } from 'constants/misc';
import { formatSymbol } from 'utils/token';

export type TDepositModalProps = {};

export interface DepositModalInterface {
  show: (token: string) => void;
}

export const DepositModal = forwardRef((_props: TDepositModalProps, ref) => {
  const isMobile = useMobile();
  const [isVisible, setIsVisible] = useState(false);
  const { getAuthToken } = useETransferAuthToken();
  const [token, setToken] = useState('');

  const onCancel = useCallback(() => {
    setIsVisible(false);
    setToken('');
  }, []);

  const show = useCallback<DepositModalInterface['show']>(
    async (token) => {
      if (!token) return;
      setToken(token);
      const receiveToken = token || 'USDT';
      ETransferConfig.setConfig({
        depositConfig: {
          ...ETRANSFER_DEPOSIT_CONFIG,
          defaultChainId: DEFAULT_CHAIN,
          defaultNetwork: ETRANSFER_DEPOSIT_DEFAULT_NETWORK,
          defaultDepositToken: 'USDT',
          supportDepositTokens: DEPOSIT_RECEIVE_SUPPORT_DEPOSIT_TOKENS[receiveToken],
          defaultReceiveToken: receiveToken,
          supportReceiveTokens: [receiveToken],
        },
      });
      setIsVisible(true);

      try {
        await getAuthToken();
      } catch (error) {
        onCancel();
      }
    },
    [getAuthToken, onCancel],
  );
  useImperativeHandle(ref, () => ({ show }));

  return (
    <CommonModal
      width="640px"
      height={isMobile ? '100vh' : '240px'}
      showType={isMobile ? 'drawer' : 'modal'}
      showBackIcon={isMobile}
      closable={!isMobile}
      centered={true}
      visible={isVisible}
      title={`Deposit ${formatSymbol(token)}`}
      className={'deposit-modal'}
      onCancel={onCancel}>
      <div className="deposit-page">
        {isVisible && (
          <ETransferStyleProvider>
            <ETransferLayoutProvider>
              <ETransferDepositProvider>
                <Deposit
                  componentStyle={isMobile ? ComponentStyle.Mobile : ComponentStyle.Web}
                  isListenNoticeAuto={false}
                  isShowProcessingTip={false}
                />
              </ETransferDepositProvider>
            </ETransferLayoutProvider>
          </ETransferStyleProvider>
        )}
      </div>
    </CommonModal>
  );
});
