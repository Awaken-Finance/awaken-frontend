import { useWebLogin } from 'aelf-web-login';
import { APPNAME } from 'config/webLoginConfig';
import { useEffect, useState } from 'react';

export const useIsPortkeySDK = () => {
  const { loginState } = useWebLogin();
  const [isPortkeySDK, setIsPortkeySDK] = useState(false);

  useEffect(() => {
    const storageStr = localStorage.getItem(`V2-${APPNAME}`);
    setIsPortkeySDK(!!storageStr);
  }, [loginState]);

  return isPortkeySDK;
};
