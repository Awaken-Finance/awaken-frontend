import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
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
import {
  ETRANSFER_DEPOSIT_CONFIG,
  ETRANSFER_DEPOSIT_DEFAULT_NETWORK,
  ETRANSFER_DEPOSIT_DEFAULT_NETWORK_MAP,
} from 'config/etransferConfig';
import { DEFAULT_CHAIN } from 'constants/index';
import { useETransferAuthToken } from 'hooks/useETransferAuthToken';
import './styles.less';
import 'pages/Deposit/styles.less';
import { DEPOSIT_RECEIVE_SUPPORT_DEPOSIT_TOKENS } from 'constants/misc';
import { formatSymbol } from 'utils/token';
import CommonLink from 'components/CommonLink';
import { useHistory } from 'react-router-dom';

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

  const latestShowTimeRef = useRef(0);
  const show = useCallback<DepositModalInterface['show']>(
    async (token) => {
      if (!token) return;
      setToken(token);
      const receiveToken = token || 'USDT';
      ETransferConfig.setConfig({
        depositConfig: {
          ...ETRANSFER_DEPOSIT_CONFIG,
          defaultChainId: DEFAULT_CHAIN,
          defaultNetwork: ETRANSFER_DEPOSIT_DEFAULT_NETWORK_MAP[receiveToken] || ETRANSFER_DEPOSIT_DEFAULT_NETWORK,
          defaultDepositToken: DEPOSIT_RECEIVE_SUPPORT_DEPOSIT_TOKENS[receiveToken][0],
          supportDepositTokens: DEPOSIT_RECEIVE_SUPPORT_DEPOSIT_TOKENS[receiveToken],
          defaultReceiveToken: receiveToken,
          supportReceiveTokens: [receiveToken],
        },
      });
      setIsVisible(true);

      const latestShowTime = Date.now();
      latestShowTimeRef.current = latestShowTime;
      try {
        await getAuthToken();
      } catch (error) {
        if (latestShowTimeRef.current !== latestShowTime) return;
        onCancel();
      }
    },
    [getAuthToken, onCancel],
  );
  useImperativeHandle(ref, () => ({ show }));

  const historyRouter = useHistory();
  const onHistoryClick = useCallback(() => {
    historyRouter.push('/deposit-history');
  }, [historyRouter]);

  return (
    <CommonModal
      width="640px"
      height={isMobile ? '100%' : '240px'}
      showType={isMobile ? 'drawer' : 'modal'}
      showBackIcon={isMobile}
      closable={!isMobile}
      centered={true}
      visible={isVisible}
      title={`Receive ${formatSymbol(token)}`}
      extra={
        isMobile && (
          <CommonLink
            className="deposit-modal-history-btn"
            size={14}
            lineHeight={22}
            color="two"
            iconProps={{ color: 'two' }}
            onClick={onHistoryClick}>
            {'History'}
          </CommonLink>
        )
      }
      className={'deposit-modal'}
      onCancel={onCancel}>
      <div className="deposit-page">
        {!isMobile && (
          <CommonLink
            className="deposit-modal-history-btn"
            size={14}
            lineHeight={22}
            color="two"
            iconProps={{ color: 'two' }}
            onClick={onHistoryClick}>
            {'History'}
          </CommonLink>
        )}

        {isVisible && (
          <ETransferStyleProvider>
            <ETransferLayoutProvider>
              <ETransferDepositProvider>
                <Deposit
                  componentStyle={isMobile ? ComponentStyle.Mobile : ComponentStyle.Web}
                  isListenNoticeAuto={true}
                  isShowProcessingTip={true}
                />
              </ETransferDepositProvider>
            </ETransferLayoutProvider>
          </ETransferStyleProvider>
        )}
      </div>
    </CommonModal>
  );
});
