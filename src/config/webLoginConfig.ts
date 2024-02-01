import { setGlobalConfig } from 'aelf-web-login';
import { CHAIN_INFO as tDVV } from 'constants/platform/aelf-tdvv';
import { CHAIN_INFO as tDVW } from 'constants/platform/aelf-tdvw';
import { CHAIN_INFO as tDVV_TEST3 } from 'constants/platform/aelf-tdvv-test3';
import { PORTKEY_SERVICE } from './portkeyonConfig';

const API_ENV = process.env.REACT_APP_API_ENV;
const APPNAME = 'awaken.finance';

let CHAIN_ID = tDVV.chainId,
  NETWORK = 'MAIN',
  NETWORK_V2 = 'MAINNET',
  RPC_SERVER = tDVV.rpcUrl,
  portkeyService = PORTKEY_SERVICE.main,
  WEBSITE_ICON = 'https://awaken.finance/favicon.ico';

switch (API_ENV) {
  case 'preview':
    CHAIN_ID = tDVW.chainId;
    NETWORK = 'TESTNET';
    NETWORK_V2 = 'TESTNET';
    RPC_SERVER = tDVW.rpcUrl;
    portkeyService = PORTKEY_SERVICE.preview;
    WEBSITE_ICON = 'https://test.awaken.finance/favicon.ico';
    break;
  case 'test':
  case 'local':
    CHAIN_ID = tDVV_TEST3.chainId;
    RPC_SERVER = tDVV_TEST3.rpcUrl;
    portkeyService = PORTKEY_SERVICE.test;
    WEBSITE_ICON = 'https://test.awaken.finance/favicon.ico';
    break;
}

setGlobalConfig({
  appName: APPNAME,
  chainId: CHAIN_ID,
  networkType: NETWORK as any,
  defaultRpcUrl: RPC_SERVER,

  portkey: {
    useLocalStorage: true,
    graphQLUrl: portkeyService.v1.graphQLUrl,
    connectUrl: portkeyService.v1.connectServer,
    serviceUrl: portkeyService.v1.apiServer,
    // loginConfig: {
    //   recommendIndexes: [0, 1],
    //   loginMethodsOrder: ['Google', 'Telegram', 'Apple', 'Phone', 'Email'],
    // },
    socialLogin: {
      Portkey: {
        websiteName: APPNAME,
        websiteIcon: WEBSITE_ICON,
      },
    },

    requestDefaults: {
      baseURL: API_ENV === 'test' ? '/portkey' : portkeyService.v1.apiServer,
      timeout: API_ENV === 'test' ? 30000 : 8000,
    },
    network: {
      defaultNetwork: NETWORK,
    },
  } as any,
  portkeyV2: {
    networkType: NETWORK_V2,
    useLocalStorage: true,
    graphQLUrl: portkeyService.v2.graphQLUrl,
    connectUrl: portkeyService.v2.connectServer,
    serviceUrl: portkeyService.v2.apiServer,
    socialLogin: {
      Portkey: {
        websiteName: APPNAME,
        websiteIcon: WEBSITE_ICON,
      },
    },
    requestDefaults: {
      baseURL: API_ENV === 'test' ? '/portkey' : portkeyService.v2.apiServer,
      timeout: API_ENV === 'test' ? 30000 : 8000,
    },
    network: {
      defaultNetwork: NETWORK_V2,
    },
  } as any,
  aelfReact: {
    appName: APPNAME,
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
  },
});
