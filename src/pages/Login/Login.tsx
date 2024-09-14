import { useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import './Login.less';
import { useMobile } from 'utils/isMobile';
import useQuery from 'hooks/useQuery';
import { sleep } from 'utils';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import { useIsConnected } from 'hooks/useLogin';
import { stringify, parseUrl } from 'query-string';

// import { message } from 'antd';

export default function Login() {
  const query = useQuery();
  const history = useHistory();
  const isMobile = useMobile();
  const { isLocking, connectWallet } = useConnectWallet();
  const isConnected = useIsConnected();

  const [tryLogin, setTryLogin] = useState(true);
  const redirect = useMemo(() => {
    return query.get('redirect') || '/';
  }, [query]);

  const visibility = useMemo(() => {
    return isConnected || isLocking ? 'hidden' : 'visible';
  }, [isConnected, isLocking]);

  const [isInit, setIsInit] = useState(false);
  useEffect(() => {
    if (!isConnected && !isLocking) {
      if (!isInit) {
        sleep(500).then(() => {
          setIsInit(true);
        });
      }
      if (isInit && tryLogin) {
        setTryLogin(false);
        connectWallet();
      }
    } else if (isLocking) {
      history.replace('/');
      connectWallet();
    } else if (isConnected) {
      const url = window.location.href;
      const parsedQuery = parseUrl(url);
      const nextParams = {
        ...parsedQuery.query,
        redirect: undefined,
      };
      history.replace(`${redirect}?${stringify(nextParams)}`);
    }
  }, [connectWallet, history, isConnected, isInit, isLocking, redirect, tryLogin]);

  // useWebLoginEvent(WebLoginEvents.LOGIN_ERROR, (error) => {
  //   message.error(error.message);
  // });

  return (
    <div className="page-login">
      <div
        id="awaken-portkey-sdk-root"
        className={isMobile ? 'awaken-portkey-sdk-mobile' : 'awaken-portkey-sdk-pc'}
        style={{
          visibility,
        }}></div>
    </div>
  );
}
