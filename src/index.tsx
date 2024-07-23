import React, { useMemo } from 'react';
import { ConfigProvider, message } from 'antd';
import { devicesEnv } from '@portkey/utils';
import { useAsync } from 'react-use';
import { createRoot } from 'react-dom/client';

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
import { WebLoginProvider, init } from '@aelf-web-login/wallet-adapter-react';
import { WEB_LOGIN_CONFIG } from './config/webLoginConfig';
import { SignInDesignEnum } from '@aelf-web-login/wallet-adapter-base';

import './config/webLoginConfig';
import './sentry';

import './index.css';
import './App.less';
import { IConfigProps } from '@aelf-web-login/wallet-adapter-bridge';

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

function RootApp() {
  // TODO: v2
  const { value, loading } = useAsync(async () => await devicesEnv.getPortkeyShellApp());

  const webLoginConfig: IConfigProps = useMemo(
    () => ({
      ...WEB_LOGIN_CONFIG,
      baseConfig: {
        ...WEB_LOGIN_CONFIG.baseConfig,
        noCommonBaseModal: true,
        design: SignInDesignEnum.Web2Design,
        SignInComponent: SignInProxy as any,
        ConfirmLogoutDialog: ConfirmLogoutDialog,
        PortkeyProviderProps: {
          theme: 'dark',
          networkType: WEB_LOGIN_CONFIG.baseConfig.networkType,
        },
      },
    }),
    [],
  );

  const bridgeAPI = init(webLoginConfig);

  return (
    <ChianProvider>
      <WebLoginProvider bridgeAPI={bridgeAPI}>
        <StoreProvider>
          <ContextProviders>
            <App />
          </ContextProviders>
        </StoreProvider>
      </WebLoginProvider>
    </ChianProvider>
  );
}

const container = document.getElementById('root');
const root = createRoot(container as HTMLElement);
root.render(<RootApp />);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
