import React from 'react';
import ReactDOM from 'react-dom';
import { ConfigProvider } from 'antd';
import { WebLoginProvider, getConfig } from 'aelf-web-login';
import { PortkeyProvider } from '@portkey/did-ui-react';
import './sentry';
import App from './App';
import ModalProvider from './contexts/useModal';
import UserProvider from 'contexts/useUser';
import UserSettingsProvider from 'contexts/useUserSettings';
import reportWebVitals from './reportWebVitals';
import StoreProvider from 'contexts/useStore';
import ChianProvider from 'contexts/useChian';
import TokenPriceProvider from 'contexts/useTokenPrice';

import { ANTD_LOCAL } from './i18n/config';
import { useLanguage } from './i18n';
import SignInProxy from 'pages/Login/SignInProxy';
import ConfirmLogoutDialog from 'Modals/ConfirmLogoutDialog';
import './config/webLoginConfig';
import '@portkey/did-ui-react/dist/assets/index.css';
import 'aelf-web-login/dist/assets/index.css';

import './index.css';
import './App.less';

function ContextProviders({ children }: { children?: React.ReactNode }) {
  const { language } = useLanguage();
  return (
    <ConfigProvider locale={ANTD_LOCAL[language]} autoInsertSpaceInButton={false}>
      <TokenPriceProvider>
        <UserProvider>
          <UserSettingsProvider>
            <ModalProvider>{children}</ModalProvider>
          </UserSettingsProvider>
        </UserProvider>
      </TokenPriceProvider>
    </ConfigProvider>
  );
}

ReactDOM.render(
  <ChianProvider>
    <PortkeyProvider networkType={getConfig().networkType} theme="dark">
      <WebLoginProvider
        extraWallets={['discover', 'elf']}
        nightElf={{ connectEagerly: true }}
        portkey={{
          autoShowUnlock: false,
          checkAccountInfoSync: true,
          SignInComponent: SignInProxy as any,
          design: 'Web2Design',
          ConfirmLogoutDialog,
        }}
        discover={{
          autoRequestAccount: true,
          autoLogoutOnAccountMismatch: true,
          autoLogoutOnChainMismatch: true,
          autoLogoutOnDisconnected: true,
          autoLogoutOnNetworkMismatch: false,
        }}>
        <StoreProvider>
          <ContextProviders>
            <App />
          </ContextProviders>
        </StoreProvider>
      </WebLoginProvider>
    </PortkeyProvider>
  </ChianProvider>,
  document.getElementById('root'),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
