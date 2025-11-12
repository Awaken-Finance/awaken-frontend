import React, { useEffect, useMemo } from 'react';
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
import { WebLoginProvider } from '@aelf-web-login/wallet-adapter-react';
import { DID_CONFIG, getConfig } from './config/webLoginConfig';
import { SignInDesignEnum } from '@aelf-web-login/wallet-adapter-base';

import './sentry';
import './index.css';
import './App.less';
import './assets/js/telegram-web-app';
import { isMobileDevice, useIsTelegram } from 'utils/isMobile';
import { ETransferConfig } from '@etransfer/ui-react';
import { etransferConfig } from 'config/etransferConfig';
import { did } from '@portkey/did';
import { checkConnectedWallet } from 'utils/portkey';

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
  // TODO: check
  // const isTelegram = useIsTelegram();

  useMemo(() => {
    did.setConfig(DID_CONFIG);
    checkConnectedWallet();
  }, []);

  // const bridgeAPI = useMemo(() => {
  //   const isMobile = isMobileDevice();
  //   return init({
  //     ...WEB_LOGIN_CONFIG,
  //     baseConfig: {
  //       ...WEB_LOGIN_CONFIG.baseConfig,
  //       noCommonBaseModal: isTelegram ? false : true,
  //       design: SignInDesignEnum.Web2Design,
  //       keyboard: true,
  //       SignInComponent: isTelegram ? undefined : (SignInProxy as any),
  //       ConfirmLogoutDialog: ConfirmLogoutDialog,
  //       PortkeyProviderProps: {
  //         theme: 'dark',
  //         networkType: WEB_LOGIN_CONFIG.baseConfig.networkType,
  //       },
  //     },
  //     wallets: isMobile ? [WEB_LOGIN_CONFIG.wallets[0], WEB_LOGIN_CONFIG.wallets[1]] : WEB_LOGIN_CONFIG.wallets,
  //   });
  // }, [isTelegram]);

  const config = useMemo(() => getConfig(), []);

  useEffect(() => {
    ETransferConfig.setConfig(etransferConfig);
  }, []);

  return (
    <ChianProvider>
      <WebLoginProvider config={config}>
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
