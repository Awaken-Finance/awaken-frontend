import { PortkeyDid } from '@aelf-web-login/wallet-adapter-bridge';
import useInterval from 'hooks/useInterval';
import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-use';
import { isNightElfApp, isPortkeyAppWithDiscover } from 'utils/isApp';

export default React.forwardRef((props, ref) => {
  const { pathname } = useLocation();
  const [shouldCallOnCancel, setShouldCallOnCancel] = useState(false);

  const [renderDom, setRenderDom] = useState<HTMLElement>();
  const [lifeCycle, setLifeCycle] = useState<any>(pathname?.startsWith('/login') ? 'Login' : 'SignUp');

  const isLogin = useMemo(() => pathname?.startsWith('/login'), [pathname]);
  const defaultLifeCycle = useMemo(() => {
    if (isLogin) {
      return {
        Login: undefined,
      };
    } else {
      return {
        SignUp: undefined,
      };
    }
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

  const SignComponent = useMemo(() => {
    return PortkeyDid.SignIn;
  }, []);

  const [isShowSign, setShowSign] = useState<Boolean>(false);

  /**
   * User open login/signup page, loginState will change to logining.
   * So we need to call onCancel when use left login/signup page.
   */
  useEffect(() => {
    if (pathname === '/login' || pathname === '/signup') {
      setShouldCallOnCancel(true);
      setShowSign(true);
      return;
    }
    if (pathname !== '/login' && pathname !== '/signup') {
      setShowSign(false);
    }
  }, [pathname, props, shouldCallOnCancel]);

  const [isPreparing, setIsPreparing] = useState(false);
  useEffect(() => {
    setIsPreparing(false);
  }, [pathname]);

  const onLifeCycleChange = (lifeCycle: any) => {
    console.log('lifeCycle', lifeCycle);
    if (!pathname?.startsWith('/login') && !pathname?.startsWith('/signup')) return;
    // if (lifeCycle === 'Login' && !pathname?.startsWith('/login')) {
    //   history.replaceState(null, '', '/login');
    // } else if (lifeCycle === 'SignUp' && !pathname?.startsWith('/signup')) {
    //   history.replaceState(null, '', '/signup');
    // }
    setLifeCycle(lifeCycle);
    if (lifeCycle === 'SetPinAndAddManager') {
      setIsPreparing(true);
    }
  };

  if (isPortkeyAppWithDiscover() || isNightElfApp()) return <></>;

  if (isPreparing && lifeCycle === 'Login') return <></>; // !!! don't delete this line

  if (!isShowSign) return <></>;

  if (!renderDom) {
    return (
      <SignComponent
        key="signin"
        {...props}
        ref={ref}
        design={isLogin ? 'Web2Design' : 'CryptoDesign'}
        keyboard={true}
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
      design={isLogin ? 'Web2Design' : 'CryptoDesign'}
      keyboard={true}
      defaultLifeCycle={defaultLifeCycle}
      onLifeCycleChange={onLifeCycleChange}
    />,
    renderDom,
  );
});
