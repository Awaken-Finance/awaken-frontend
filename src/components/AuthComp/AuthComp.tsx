import { Route } from 'react-router-dom';
import { appendRedirect } from 'hooks/useLogin';
import CustomRedirect from './CustomRedirect';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';

export function AuthComp({ component: Component, path }: { component: any; path: string }) {
  const { walletInfo } = useConnectWallet();

  return walletInfo?.address ? (
    <Route render={(props) => <Component url={path} {...props} />} />
  ) : (
    <CustomRedirect preserveQueryString to={appendRedirect('/login')} />
  );
}
