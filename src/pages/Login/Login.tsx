import { WebLoginEvents, WebLoginState, usePortkeyPreparing, useWebLogin, useWebLoginEvent } from 'aelf-web-login';
import { useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import './Login.less';
import { useMobile } from 'utils/isMobile';
import useQuery from 'hooks/useQuery';
import { message } from 'antd';

export default function Login() {
  const query = useQuery();
  const history = useHistory();
  const isMobile = useMobile();
  const { isPreparing } = usePortkeyPreparing();
  const { loginState, login } = useWebLogin();
  const [tryLogin, setTryLogin] = useState(true);
  const redirect = useMemo(() => {
    return query.get('redirect') || '/';
  }, [query]);

  const visibility = useMemo(() => {
    return loginState === WebLoginState.logined || loginState === WebLoginState.lock || isPreparing
      ? 'hidden'
      : 'visible';
  }, [isPreparing, loginState]);

  useEffect(() => {
    if (loginState === WebLoginState.initial) {
      if (tryLogin) {
        setTryLogin(false);
        login();
      }
    } else if (loginState === WebLoginState.lock) {
      history.replace('/');
    } else if (loginState === WebLoginState.logined) {
      history.replace(redirect);
    }
  }, [history, login, loginState, redirect, tryLogin]);

  useWebLoginEvent(WebLoginEvents.LOGIN_ERROR, (error) => {
    message.error(error.message);
  });

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
