import { SignIn } from '@portkey/did-ui-react';
import { WebLoginState, useMultiWallets, usePortkeyPreparing, useWebLogin } from 'aelf-web-login';
import useInterval from 'hooks/useInterval';
import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-use';
import { isNightElfApp, isPortkeyAppWithDiscover } from 'utils/isApp';
import isMobile from 'utils/isMobile';

export default React.forwardRef((props, ref) => {
  const { wallet, loginState } = useWebLogin();
  const { switching } = useMultiWallets();
  const { isPreparing } = usePortkeyPreparing();
  const { pathname } = useLocation();
  const [shouldCallOnCancel, setShouldCallOnCancel] = useState(false);
  const [renderDom, setRenderDom] = useState<HTMLElement>();
  const [lifeCycle, setLifeCycle] = useState<any>(pathname?.startsWith('/login') ? 'Login' : 'SignUp');

  console.log(wallet.portkeyInfo?.walletInfo?.address);

  const defaultLifeCycle = useMemo(() => {
    if (pathname?.startsWith('/login')) {
      return {
        Login: undefined,
      };
    } else {
      return {
        SignUp: undefined,
      };
    }
  }, [pathname]);
  const isLogin = useMemo(() => {
    return lifeCycle === 'Login' || !lifeCycle;
  }, [lifeCycle]);

  const width = useMemo(() => {
    return isLogin ? '960px' : '548px';
  }, [isLogin]);
  const height = useMemo(() => {
    return isLogin ? '720px' : '652px';
  }, [isLogin]);

  useInterval(
    () => {
      const dom = document.getElementById('awaken-portkey-sdk-root');
      if (dom && dom !== renderDom) {
        setRenderDom(dom);
      }
    },
    100,
    [renderDom],
  );

  useEffect(() => {
    if (isMobile().any) return;
    const dom = document.getElementById('awaken-portkey-sdk-root');
    if (dom) {
      dom.style.width = width;
      dom.style.minHeight = height;
    }
  }, [height, width]);

  /**
   * User open login/signup page, loginState will change to logining.
   * So we need to call onCancel when use left login/signup page.
   */
  useEffect(() => {
    if (loginState === WebLoginState.initial) {
      setLifeCycle(null);
    }
    if (pathname === '/login' || pathname === '/signup') {
      setShouldCallOnCancel(true);
      return;
    }
    if (pathname !== '/login' && pathname !== '/signup') {
      const anyProps = props as any;
      if (!switching && loginState === WebLoginState.logining && shouldCallOnCancel) {
        setShouldCallOnCancel(false);
        anyProps.onCancel();
      }
    }
  }, [loginState, pathname, props, shouldCallOnCancel, switching]);

  const onLifeCycleChange = (lifeCycle: any) => {
    if (!pathname?.startsWith('/login') && !pathname?.startsWith('/signup')) return;
    if (lifeCycle === 'Login' && !pathname?.startsWith('/login')) {
      history.replaceState(null, '', '/login');
    } else if (lifeCycle === 'SignUp' && !pathname?.startsWith('/signup')) {
      history.replaceState(null, '', '/signup');
    }
    setLifeCycle(lifeCycle);
  };

  if (isPortkeyAppWithDiscover() || isNightElfApp()) return <></>;

  if (isPreparing) return <></>; // !!! don't delete this line
  if (switching) return <></>;

  if (!renderDom) {
    return (
      <SignIn
        key="signin"
        {...props}
        ref={ref}
        defaultLifeCycle={defaultLifeCycle}
        onLifeCycleChange={onLifeCycleChange}
      />
    );
  }

  return createPortal(
    <SignIn
      key="signin"
      {...props}
      ref={ref}
      uiType="Full"
      defaultLifeCycle={defaultLifeCycle}
      onLifeCycleChange={onLifeCycleChange}
    />,
    renderDom,
  );
});
