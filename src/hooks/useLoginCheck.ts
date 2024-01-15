import { WalletType, WebLoginState, useWebLogin } from 'aelf-web-login';
import useLogin from './useLogin';
import { basicModalView } from 'contexts/useModal/actions';
import { useModalDispatch } from 'contexts/useModal/hooks';
import { useCallback } from 'react';

export default function useLoginCheck<T = any>(
  options: {
    checkAccountSync: boolean;
    redirect?: string | undefined;
  },
  callback?: (arg: T) => void,
  onGotoLogin?: () => void,
) {
  const { wallet, walletType, loginState, loginEagerly } = useWebLogin();
  const { toLogin } = useLogin(options.redirect);

  const dispatch = useModalDispatch();

  const popupSynchronizedAccountInfoModal = useCallback(() => {
    dispatch(basicModalView.setSynchronizedAccountInfoModal.actions(true));
  }, [dispatch]);

  const checkLogin = (e?: any) => {
    e?.stopPropagation?.();
    if (options.checkAccountSync && loginState === WebLoginState.logined && walletType === WalletType.portkey) {
      if (!wallet.accountInfoSync.syncCompleted) {
        popupSynchronizedAccountInfoModal();
        return true;
      }
    }
    if (wallet.address) {
      callback && callback(e);
      return true;
    }
    if (loginState === WebLoginState.lock || loginState === WebLoginState.eagerly) {
      onGotoLogin?.();
      loginEagerly();
    } else if (loginState === WebLoginState.initial) {
      onGotoLogin?.();
      toLogin();
    }
  };

  return checkLogin;
}
