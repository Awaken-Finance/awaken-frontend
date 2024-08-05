import { APP_NAME } from 'config/webLoginConfig';
import { useEffect, useState } from 'react';
import { useIsConnected } from './useLogin';

export const useIsPortkeySDK = () => {
  const isConnected = useIsConnected();
  const [isPortkeySDK, setIsPortkeySDK] = useState(false);

  useEffect(() => {
    const storageStr = localStorage.getItem(`V2-${APP_NAME}`);
    setIsPortkeySDK(!!storageStr);
  }, [isConnected]);

  return isPortkeySDK;
};
