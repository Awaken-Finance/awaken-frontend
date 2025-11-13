import { CHAIN_INFO as tDVV } from 'constants/platform/aelf-tdvv';
import { CHAIN_INFO as tDVW } from 'constants/platform/aelf-tdvw';
import { PORTKEY_SERVICE } from './portkeyonConfig';
import { NetworkType } from '@portkey/provider-types';
import { PortkeyDiscoverWallet } from '@aelf-web-login/wallet-adapter-portkey-discover';
import { PortkeyInnerWallet } from '@aelf-web-login/wallet-adapter-portkey-web';
import { NightElfWallet } from '@aelf-web-login/wallet-adapter-night-elf';
import { IConfigProps } from '@aelf-web-login/wallet-adapter-bridge';
import { SignInDesignEnum, TChainId } from '@aelf-web-login/wallet-adapter-base';
import { FairyVaultDiscoverWallet } from '@aelf-web-login/wallet-adapter-fairy-vault-discover';
import { devices, TelegramPlatform } from '@portkey/utils';

const API_ENV = process.env.REACT_APP_API_ENV;
export const APP_NAME = 'awaken.finance';

let CHAIN_ID = tDVV.chainId as TChainId,
  networkType = 'MAINNET' as NetworkType,
  RPC_SERVER = tDVV.rpcUrl,
  portkeyService = PORTKEY_SERVICE.main,
  WEBSITE_ICON = 'https://app.awaken.finance/favicon.ico',
  TELEGRAM_BOT_ID = '7354497113',
  tgBotLink = 'https://t.me/AwakenSwap_Bot';

switch (API_ENV) {
  case 'preview':
  case 'test':
  case 'local':
    CHAIN_ID = tDVW.chainId as TChainId;
    networkType = 'TESTNET';
    RPC_SERVER = tDVW.rpcUrl;
    portkeyService = PORTKEY_SERVICE.preview;
    WEBSITE_ICON = 'https://test-app.awaken.finance/favicon.ico';
    TELEGRAM_BOT_ID = '7387260361';
    tgBotLink = 'https://t.me/AwakenSwap_Test_Bot';
    break;
}

export const DID_CONFIG = {
  graphQLUrl: portkeyService.v2.graphQLUrl,
  connectUrl: portkeyService.v2.connectServer,
  serviceUrl: portkeyService.v2.apiServer,
  requestDefaults: {
    baseURL: portkeyService.v2.apiServer,
    timeout: 30000,
  },
  socialLogin: {
    Portkey: {
      websiteName: APP_NAME,
      websiteIcon: WEBSITE_ICON,
    },
    Telegram: {
      botId: TELEGRAM_BOT_ID,
    },
  },
  networkType: networkType,
  referralInfo: {
    referralCode: '',
    projectCode: '13005',
  },
};

const baseConfig: IConfigProps['baseConfig'] = {
  networkType: networkType as any,
  chainId: CHAIN_ID,
  sideChainId: CHAIN_ID,
  design: SignInDesignEnum.CryptoDesign, // "SocialDesign" | "CryptoDesign" | "Web2Design"
  enableAcceleration: true,
  appName: APP_NAME,
  theme: 'dark',
};

export function getConfig() {
  const isTelegramPlatform = TelegramPlatform.isTelegramPlatform();
  const portkeyInnerWallet = new PortkeyInnerWallet({
    networkType: networkType,
    chainId: CHAIN_ID,
    disconnectConfirm: true,
  });
  const fairyVaultDiscoverWallet = new FairyVaultDiscoverWallet({
    networkType: networkType,
    chainId: CHAIN_ID,
    autoRequestAccount: true, // If set to true, please contact Portkey to add whitelist
    autoLogoutOnDisconnected: true,
    autoLogoutOnNetworkMismatch: true,
    autoLogoutOnAccountMismatch: true,
    autoLogoutOnChainMismatch: true,
  });
  setTimeout(() => {
    (fairyVaultDiscoverWallet as any).detect();
  }, 100);
  const isMobileDevices = devices.isMobileDevices();
  const config: IConfigProps = {
    baseConfig,
    wallets: isTelegramPlatform
      ? [portkeyInnerWallet]
      : isMobileDevices
      ? [
          portkeyInnerWallet,
          fairyVaultDiscoverWallet,
          new PortkeyDiscoverWallet({
            networkType: networkType,
            chainId: CHAIN_ID,
            autoRequestAccount: true,
            autoLogoutOnDisconnected: true,
            autoLogoutOnNetworkMismatch: true,
            autoLogoutOnAccountMismatch: true,
            autoLogoutOnChainMismatch: true,
          }),
        ]
      : [
          portkeyInnerWallet,
          fairyVaultDiscoverWallet,
          new PortkeyDiscoverWallet({
            networkType: networkType,
            chainId: CHAIN_ID,
            autoRequestAccount: true,
            autoLogoutOnDisconnected: true,
            autoLogoutOnNetworkMismatch: true,
            autoLogoutOnAccountMismatch: true,
            autoLogoutOnChainMismatch: true,
          }),
          new NightElfWallet({
            chainId: CHAIN_ID,
            appName: APP_NAME,
            connectEagerly: true,
            defaultRpcUrl: RPC_SERVER,
            nodes: {
              AELF: {
                chainId: 'AELF',
                rpcUrl: RPC_SERVER,
              },
              tDVW: {
                chainId: 'tDVW',
                rpcUrl: RPC_SERVER,
              },
              tDVV: {
                chainId: 'tDVV',
                rpcUrl: RPC_SERVER,
              },
            },
          }),
        ],
  };
  return config;
}

export const TG_BOT_LINK = tgBotLink;
export const NETWORK_TYPE = networkType;
