import { CHAIN_INFO as tDVV } from 'constants/platform/aelf-tdvv';
import { CHAIN_INFO as tDVW } from 'constants/platform/aelf-tdvw';
import { PORTKEY_SERVICE } from './portkeyonConfig';
import { NetworkType } from '@portkey/provider-types';
import { PortkeyDiscoverWallet } from '@aelf-web-login/wallet-adapter-portkey-discover';
import { PortkeyAAWallet } from '@aelf-web-login/wallet-adapter-portkey-aa';
import { NightElfWallet } from '@aelf-web-login/wallet-adapter-night-elf';
import { IConfigProps } from '@aelf-web-login/wallet-adapter-bridge';
import { TChainId } from '@aelf-web-login/wallet-adapter-base';

const API_ENV = process.env.REACT_APP_API_ENV;
export const APP_NAME = 'awaken.finance';

let CHAIN_ID = tDVV.chainId as TChainId,
  NETWORK_TYPE = 'MAINNET' as NetworkType,
  RPC_SERVER = tDVV.rpcUrl,
  portkeyService = PORTKEY_SERVICE.main,
  WEBSITE_ICON = 'https://awaken.finance/favicon.ico',
  TELEGRAM_BOT_ID = '7354497113';

switch (API_ENV) {
  case 'preview':
  case 'test':
  case 'local':
    CHAIN_ID = tDVW.chainId as TChainId;
    NETWORK_TYPE = 'TESTNET';
    RPC_SERVER = tDVW.rpcUrl;
    portkeyService = PORTKEY_SERVICE.preview;
    WEBSITE_ICON = 'https://test.awaken.finance/favicon.ico';
    TELEGRAM_BOT_ID = '7387260361';
    break;
}

const didConfig = {
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
  loginConfig: {
    loginMethodsOrder: ['Email', 'Google', 'Apple', 'Telegram', 'Scan'],
  },
  networkType: NETWORK_TYPE,
};

const baseConfig = {
  networkType: NETWORK_TYPE,
  chainId: CHAIN_ID,
  keyboard: true,
  noCommonBaseModal: false,
  design: 'CryptoDesign', // "SocialDesign" | "CryptoDesign" | "Web2Design"
  titleForSocialDesign: 'Crypto wallet',
  iconSrcForSocialDesign: 'https://awaken.finance/favicon.ico',
};

const wallets = [
  new PortkeyAAWallet({
    appName: APP_NAME,
    chainId: CHAIN_ID,
    autoShowUnlock: true,
  }),
  new PortkeyDiscoverWallet({
    networkType: NETWORK_TYPE,
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
];

export const WEB_LOGIN_CONFIG = {
  didConfig,
  baseConfig,
  wallets,
} as IConfigProps;
