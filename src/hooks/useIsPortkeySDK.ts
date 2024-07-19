import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import { APP_NAME } from 'config/webLoginConfig';
import { useEffect, useState } from 'react';

export const useIsPortkeySDK = () => {
  const { isConnected } = useConnectWallet();
  const [isPortkeySDK, setIsPortkeySDK] = useState(false);

  useEffect(() => {
    const storageStr = localStorage.getItem(`V2-${APP_NAME}`);
    setIsPortkeySDK(!!storageStr);
  }, [isConnected]);

  return isPortkeySDK;
};
