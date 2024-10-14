import { useHistory } from 'react-router-dom';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import { isNightElfApp, isPortkeyAppWithDiscover } from 'utils/isApp';
import { useIsTelegram } from 'utils/isMobile';
import { useMemo } from 'react';

export const useIsConnected = () => {
  const { walletInfo } = useConnectWallet();
  return useMemo(() => !!walletInfo, [walletInfo]);
};

export function appendRedirect(path: string, redirect: string | undefined = undefined) {
  const { pathname } = window.location;
  const { search } = window.location;
  const redirectPath = redirect || pathname + search;

  if (redirectPath.startsWith('/login') || redirectPath.startsWith('/signup')) {
    return path;
  }

  const newPath = path + '?redirect=' + redirectPath;
  return newPath;
}

export default function useLogin(redirect: string | undefined = undefined) {
  const { isLocking, connectWallet } = useConnectWallet();
  const isConnected = useIsConnected();
  const history = useHistory();
  const isTelegram = useIsTelegram();

  const toLogin = () => {
    if (isLocking) {
      connectWallet();
      return;
    }

    if (!isConnected) {
      if (isPortkeyAppWithDiscover() || isNightElfApp() || isTelegram) {
        connectWallet();
        return;
      } else {
        history.push(appendRedirect('/login', redirect));
        return;
      }
    }

    console.log('toLogin invalid');
  };

  const toSignup = () => {
    if (!isConnected && !isLocking) {
      if (isPortkeyAppWithDiscover() || isNightElfApp() || isTelegram) {
        connectWallet();
        return;
      } else {
        history.push(appendRedirect('/signup', redirect));
        return;
      }
    }
    console.log('toSignup invalid');
  };

  return {
    toLogin,
    toSignup,
  };
}
