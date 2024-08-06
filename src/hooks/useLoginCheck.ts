import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import useLogin, { useIsConnected } from './useLogin';
import { basicModalView } from 'contexts/useModal/actions';
import { useModalDispatch } from 'contexts/useModal/hooks';
import { useCallback } from 'react';
import { WalletTypeEnum } from '@aelf-web-login/wallet-adapter-base';
import { WEB_LOGIN_CONFIG } from 'config/webLoginConfig';

export default function useLoginCheck<T = any>(
  options: {
    checkAccountSync: boolean;
    redirect?: string | undefined;
  },
  callback?: (arg: T) => void,
  onGotoLogin?: () => void,
) {
  const { walletType, walletInfo, getWalletSyncIsCompleted } = useConnectWallet();
  const isConnected = useIsConnected();

  const { toLogin } = useLogin(options.redirect);

  const dispatch = useModalDispatch();

  const popupSynchronizedAccountInfoModal = useCallback(() => {
    dispatch(basicModalView.setSynchronizedAccountInfoModal.actions(true));
  }, [dispatch]);

  const checkLogin = useCallback(
    async (e?: any) => {
      e?.stopPropagation?.();
      if (!isConnected) {
        onGotoLogin?.();
        toLogin();
        return;
      }

      if (options.checkAccountSync && isConnected && walletType === WalletTypeEnum.aa) {
        const syncCompleted = await getWalletSyncIsCompleted(WEB_LOGIN_CONFIG.baseConfig.chainId);
        if (!syncCompleted) {
          popupSynchronizedAccountInfoModal();
          return true;
        }
      }
      if (walletInfo?.address) {
        callback && callback(e);
        return true;
      }
    },
    [
      callback,
      getWalletSyncIsCompleted,
      isConnected,
      onGotoLogin,
      options.checkAccountSync,
      popupSynchronizedAccountInfoModal,
      toLogin,
      walletInfo?.address,
      walletType,
    ],
  );

  return checkLogin;
}
