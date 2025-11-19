import useInterval from 'hooks/useInterval';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-use';
import { isNightElfApp, isPortkeyAppWithDiscover } from 'utils/isApp';

export default React.forwardRef((props) => {
  const { pathname } = useLocation();
  const [shouldCallOnCancel, setShouldCallOnCancel] = useState(false);

  const [renderDom, setRenderDom] = useState<HTMLElement>();
  const [lifeCycle] = useState<any>(pathname?.startsWith('/login') ? 'Login' : 'SignUp');

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

  if (isPortkeyAppWithDiscover() || isNightElfApp()) return <></>;

  if (isPreparing && lifeCycle === 'Login') return <></>; // !!! don't delete this line

  if (!isShowSign) return <></>;

  // if (!renderDom) {
  //   return (
  //     <SignComponent
  //       key="signin"
  //       {...props}
  //       ref={ref}
  //       design={isLogin ? 'Web2Design' : 'CryptoDesign'}
  //       keyboard={true}
  //       defaultLifeCycle={defaultLifeCycle}
  //       onLifeCycleChange={onLifeCycleChange}
  //     />
  //   );
  // }

  return null;
});
