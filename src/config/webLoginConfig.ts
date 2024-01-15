import { setGlobalConfig } from 'aelf-web-login';
import { CHAIN_INFO as tDVV } from 'constants/platform/aelf-tdvv';
import { CHAIN_INFO as tDVW } from 'constants/platform/aelf-tdvw';
import { CHAIN_INFO as tDVV_TEST3 } from 'constants/platform/aelf-tdvv-test3';

const API_ENV = process.env.REACT_APP_API_ENV;
const APPNAME = 'awaken.finance';
const WEBSITE_ICON = API_ENV ? 'https://test.awaken.finance/favicon.ico' : 'https://awaken.finance/favicon.ico';

let CHAIN_ID = tDVV.chainId,
  NETWORK = 'MAIN',
  RPC_SERVER = tDVV.rpcUrl;

switch (API_ENV) {
  case 'preview':
    CHAIN_ID = tDVW.chainId;
    NETWORK = 'TESTNET';
    RPC_SERVER = tDVW.rpcUrl;
    break;
  case 'test':
    CHAIN_ID = tDVV_TEST3.chainId;
    RPC_SERVER = tDVV_TEST3.rpcUrl;
    break;
  case 'local':
    CHAIN_ID = tDVV_TEST3.chainId;
    RPC_SERVER = tDVV_TEST3.rpcUrl;
    break;
}

console.log(RPC_SERVER);

const portkeyServices = {
  local: {
    graphQLUrl: '/AElfIndexer_DApp/PortKeyIndexerCASchema/graphql',
    apiServer: 'http://192.168.66.203:5001',
    connectServer: 'http://192.168.66.203:8001',
  },
  test: {
    graphQLUrl: '/AElfIndexer_DApp/PortKeyIndexerCASchema/graphql',
    apiServer: 'http://192.168.66.203:5001',
    connectServer: 'http://192.168.66.203:8001',
  },
  preview: {
    graphQLUrl: 'https://dapp-portkey-test.portkey.finance/Portkey_DID/PortKeyIndexerCASchema/graphql',
    apiServer: 'https://did-portkey-test.portkey.finance',
    connectServer: 'https://auth-portkey-test.portkey.finance',
  },
  main: {
    graphQLUrl: 'https://dapp-portkey.portkey.finance/Portkey_DID/PortKeyIndexerCASchema/graphql',
    apiServer: 'https://did-portkey.portkey.finance',
    connectServer: 'https://auth-portkey.portkey.finance',
  },
};

let portkeyService = portkeyServices.main;
if (API_ENV === 'preview') {
  portkeyService = portkeyServices.preview;
} else if (API_ENV === 'test') {
  portkeyService = portkeyServices.test;
} else if (API_ENV === 'local') {
  portkeyService = portkeyServices.test;
}

const graphQLUrl = portkeyService.graphQLUrl;
const portkeyApiServer = portkeyService.apiServer;
export const connectUrl = portkeyService.connectServer;

setGlobalConfig({
  appName: APPNAME,
  chainId: CHAIN_ID,
  networkType: NETWORK as any,
  defaultRpcUrl: RPC_SERVER,
  portkey: {
    useLocalStorage: true,
    graphQLUrl: graphQLUrl,
    connectUrl: connectUrl,
    socialLogin: {
      Portkey: {
        websiteName: APPNAME,
        websiteIcon: WEBSITE_ICON,
      },
    },
    requestDefaults: {
      baseURL: API_ENV === 'test' ? '/portkey' : portkeyApiServer,
      timeout: API_ENV === 'test' ? 30000 : 8000,
    },
    network: {
      defaultNetwork: NETWORK,
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
