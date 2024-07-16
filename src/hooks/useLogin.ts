import { useHistory } from 'react-router-dom';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';

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
  const { isConnected, isLocking, connectWallet } = useConnectWallet();
  const history = useHistory();

  const toLogin = () => {
    if (isLocking) {
      connectWallet();
      return;
    }
    // TODO: v2
    if (!isConnected) {
      history.push(appendRedirect('/login', redirect));
      return;
    }

    console.log('toLogin invalid');
  };

  const toSignup = () => {
    if (!isConnected && !isLocking) {
      history.push(appendRedirect('/signup', redirect));
      return;
    }
    console.log('toSignup invalid');
  };

  return {
    toLogin,
    toSignup,
  };
}
