// import {
//   WebLoginState,
//   useMultiWallets,
//   usePortkeyPreparing,
//   useWebLogin,
//   PortkeyDid,
//   PortkeyDidV1,
// } from 'aelf-web-login';
import { PortkeyDid } from '@aelf-web-login/wallet-adapter-bridge';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import useInterval from 'hooks/useInterval';
import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-use';
import { isNightElfApp, isPortkeyAppWithDiscover } from 'utils/isApp';
import isMobile from 'utils/isMobile';
// import { SignIn } from '@portkey/did-ui-react';

export default React.forwardRef((props, ref) => {
  // const { isConnected, isLocking } = useConnectWallet();
  // const { switching } = useMultiWallets();
  // const { isPreparing } = usePortkeyPreparing();
  const { pathname } = useLocation();
  const [shouldCallOnCancel, setShouldCallOnCancel] = useState(false);

  const [renderDom, setRenderDom] = useState<HTMLElement>();
  const [lifeCycle, setLifeCycle] = useState<any>(pathname?.startsWith('/login') ? 'Login' : 'SignUp');

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

  const SignComponent = useMemo(() => {
    return PortkeyDid.SignIn;
  }, []);

  const [isShowSign, setShowSign] = useState<Boolean>(false);

  /**
   * User open login/signup page, loginState will change to logining.
   * So we need to call onCancel when use left login/signup page.
   */
  useEffect(() => {
    // if (!isConnected && !isLocking) {
    //   setLifeCycle(null);
    // }
    if (pathname === '/login' || pathname === '/signup') {
      setShouldCallOnCancel(true);
      setShowSign(true);
      return;
    }
    if (pathname !== '/login' && pathname !== '/signup') {
      setShowSign(false);
      // const anyProps = props as any;
      // TODO: v2
      // if (!switching && loginState === WebLoginState.logining && shouldCallOnCancel) {
      //   setShouldCallOnCancel(false);
      //   anyProps.onCancel();
      // }
    }
  }, [pathname, props, shouldCallOnCancel]);

  const [isPreparing, setIsPreparing] = useState(false);
  useEffect(() => {
    setIsPreparing(false);
  }, [pathname]);

  const onLifeCycleChange = (lifeCycle: any) => {
    console.log('lifeCycle', lifeCycle);
    if (!pathname?.startsWith('/login') && !pathname?.startsWith('/signup')) return;
    if (lifeCycle === 'Login' && !pathname?.startsWith('/login')) {
      history.replaceState(null, '', '/login');
    } else if (lifeCycle === 'SignUp' && !pathname?.startsWith('/signup')) {
      history.replaceState(null, '', '/signup');
    }
    setLifeCycle(lifeCycle);
    if (lifeCycle === 'SetPinAndAddManager') {
      setIsPreparing(true);
    }
  };

  if (isPortkeyAppWithDiscover() || isNightElfApp()) return <></>;

  if (isPreparing && lifeCycle === 'Login') return <></>; // !!! don't delete this line
  // if (switching) return <></>;

  if (!isShowSign) return <></>;

  if (!renderDom) {
    return (
      <SignComponent
        key="signin"
        {...props}
        ref={ref}
        defaultLifeCycle={defaultLifeCycle}
        onLifeCycleChange={onLifeCycleChange}
      />
    );
  }

  return createPortal(
    <SignComponent
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
