import React from 'react';
import ReactDOM from 'react-dom';
import { ConfigProvider, message } from 'antd';
import { WebLoginProvider, getConfig, PortkeyProvider, PortkeyDid, PortkeyDidV1 } from 'aelf-web-login';

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
import './sentry';

import '@portkey/did-ui-react/dist/assets/index.css';
import '@portkey-v1/did-ui-react/dist/assets/index.css';
import 'aelf-web-login/dist/assets/index.css';

import './index.css';
import './App.less';

message.config({
  maxCount: 1,
});

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
    <PortkeyProvider
      networkType={getConfig().networkType as PortkeyDidV1.NetworkType}
      networkTypeV2={getConfig().portkeyV2?.networkType as PortkeyDid.NetworkType}
      theme="dark">
      <WebLoginProvider
        extraWallets={['discover', 'elf']}
        nightElf={{ connectEagerly: true }}
        portkey={{
          autoShowUnlock: false,
          checkAccountInfoSync: true,
          SignInComponent: SignInProxy as any,
          design: 'Web2Design',
          ConfirmLogoutDialog,
          noCommonBaseModal: true,
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
