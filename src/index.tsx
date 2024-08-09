import React, { useMemo } from 'react';
import { ConfigProvider, message } from 'antd';
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

import './sentry';
import './index.css';
import './App.less';
import './assets/js/telegram-web-app';
import { isMobileDevice, useIsTelegram } from 'utils/isMobile';

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
  const isTelegram = useIsTelegram();

  const bridgeAPI = useMemo(() => {
    const isMobile = isMobileDevice();
    return init({
      ...WEB_LOGIN_CONFIG,
      baseConfig: {
        ...WEB_LOGIN_CONFIG.baseConfig,
        noCommonBaseModal: isTelegram ? false : true,
        design: SignInDesignEnum.Web2Design,
        SignInComponent: isTelegram ? undefined : (SignInProxy as any),
        ConfirmLogoutDialog: ConfirmLogoutDialog,
        PortkeyProviderProps: {
          theme: 'dark',
          networkType: WEB_LOGIN_CONFIG.baseConfig.networkType,
        },
      },
      wallets: isMobile ? [WEB_LOGIN_CONFIG.wallets[0], WEB_LOGIN_CONFIG.wallets[1]] : WEB_LOGIN_CONFIG.wallets,
    });
  }, [isTelegram]);

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
