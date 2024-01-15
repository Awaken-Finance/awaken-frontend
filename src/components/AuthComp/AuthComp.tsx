import { Route } from 'react-router-dom';
import { useWebLogin } from 'aelf-web-login';
import { appendRedirect } from 'hooks/useLogin';
import CustomRedirect from './CustomRedirect';

export function AuthComp({ component: Component, path }: { component: any; path: string }) {
  const { wallet } = useWebLogin();

  return wallet.address ? (
    <Route render={(props) => <Component url={path} {...props} />} />
  ) : (
    <CustomRedirect preserveQueryString to={appendRedirect('/login')} />
  );
}
