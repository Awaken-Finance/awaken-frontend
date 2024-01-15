import { WebLoginState, useWebLogin } from 'aelf-web-login';
import { useHistory } from 'react-router-dom';
import { isNightElfApp, isPortkeyAppWithDiscover } from 'utils/isApp';

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

export default function useLogin(redirect: string | undefined = undefined) {
  const { loginState, login } = useWebLogin();
  const history = useHistory();

  const toLogin = () => {
    if (loginState === WebLoginState.initial || loginState === WebLoginState.logining) {
      if (isPortkeyAppWithDiscover() || isNightElfApp()) {
        login();
      } else {
        history.push(appendRedirect('/login', redirect));
      }
    } else if (loginState === WebLoginState.eagerly || loginState === WebLoginState.lock) {
      login();
    }
  };

  const toSignup = () => {
    if (loginState === WebLoginState.initial || loginState === WebLoginState.logining) {
      if (isPortkeyAppWithDiscover() || isNightElfApp()) {
        login();
      } else {
        history.push(appendRedirect('/signup', redirect));
      }
    } else if (loginState === WebLoginState.eagerly || loginState === WebLoginState.lock) {
      login();
    }
  };

  return {
    toLogin,
    toSignup,
  };
}
