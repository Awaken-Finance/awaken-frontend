import { ERR_CODE, WalletTypeEnum } from '@aelf-web-login/wallet-adapter-base';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import { useMemo } from 'react';
import { checkConnectedWallet } from 'utils/portkey';

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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function useLogin(_redirect: string | undefined = undefined) {
  const { isLocking, connectWallet } = useConnectWallet();
  const isConnected = useIsConnected();

  const toLogin = async () => {
    try {
      await connectWallet();
    } catch (error: any) {
      // NightElf unavailable. Clear cache.
      if (error?.nativeError?.code === ERR_CODE.INIT_BRIDGE_ERROR) {
        checkConnectedWallet(WalletTypeEnum.elf);
      }
    }
  };

  const toSignup = async () => {
    if (!isConnected && !isLocking) {
      try {
        await connectWallet();
        console.log('1231');
      } catch (error) {
        console.log(error, '=====error');
      }
    }
  };

  return {
    toLogin,
    toSignup,
  };
}
