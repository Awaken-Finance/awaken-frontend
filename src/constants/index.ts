import * as MAINNET from './platform/main';
import * as KOVAN from './platform/kovan';
import * as BSC from './platform/bsc';
import * as BSCTEST from './platform/bsc-test';
import * as HECO from './platform/heco';
import * as HECOTEST from './platform/heco-test';
import * as OEC from './platform/oec';
import * as OECTEST from './platform/oec-test';
import * as POLYGON from './platform/polygon';
import * as POLYGONTEST from './platform/polygon-test';
import * as AELF_MAIN from './platform/aelf-test';
import * as AELF_tDVV from './platform/aelf-tdvv';
import * as AELF_tDVW from './platform/aelf-tdvw';
import * as AELF_TDVV_TEST3 from './platform/aelf-tdvv-test3';
import { SupportedChainId, SupportedELFChainId } from './chain';

const API_ENV = process.env.REACT_APP_API_ENV;

export type ChainConstantsType =
  | typeof MAINNET
  | typeof KOVAN
  | typeof BSC
  | typeof BSCTEST
  | typeof HECO
  | typeof HECOTEST
  | typeof AELF_MAIN
  | typeof AELF_tDVV
  | typeof AELF_tDVW
  | typeof AELF_TDVV_TEST3;

export interface WalletInfo {
  connector?: string;
  name: string;
  icon: string;
  description: string;
  href: string | null;
  color: string;
  primary?: true;
  mobile?: true;
  mobileOnly?: true;
}
export type CHAIN_ID_TYPE = keyof typeof supportedChainId;

let defaultChainInfo: ChainConstantsType = AELF_tDVV;
switch (API_ENV) {
  case 'local':
  case 'test':
    defaultChainInfo = AELF_TDVV_TEST3;
    break;
  case 'preview':
    defaultChainInfo = AELF_tDVW;
    break;
  default:
    defaultChainInfo = AELF_tDVV;
    break;
}

// console.log('API_ENV', API_ENV);

export const DEFAULT_CHAIN = defaultChainInfo.CHAIN_INFO.chainId as SupportedELFChainId;
export const DEFAULT_CHAIN_INFO = defaultChainInfo;

export const supportedChainId = {
  [SupportedChainId.MAINNET]: MAINNET,
  [SupportedChainId.KOVAN]: KOVAN,
  [SupportedChainId.BSC_MAINNET]: BSC,
  [SupportedChainId.BSC_TESTNET]: BSCTEST,
  [SupportedChainId.HECO_MAINNET]: HECO,
  [SupportedChainId.HECO_TESTNET]: HECOTEST,
  [SupportedChainId.OEC_MAINNET]: OEC,
  [SupportedChainId.OEC_TESTNET]: OECTEST,
  [SupportedChainId.POLYGON_MAINNET]: POLYGON,
  [SupportedChainId.POLYGON_TESTNET]: POLYGONTEST,

  [SupportedELFChainId.MAINNET]: AELF_MAIN,
  [SupportedELFChainId.tDVV]: DEFAULT_CHAIN_INFO,
  [SupportedELFChainId.tDVW]: DEFAULT_CHAIN_INFO,
};

export const CHAIN_NAME: { [chainId in SupportedChainId | SupportedELFChainId]: string } = {
  [SupportedChainId.MAINNET]: 'Ethereum',
  [SupportedChainId.KOVAN]: 'Kovan',
  [SupportedChainId.BSC_MAINNET]: 'BSC Mainnet',
  [SupportedChainId.BSC_TESTNET]: 'BSC Testnet',
  [SupportedChainId.HECO_MAINNET]: 'HECO Mainnet',
  [SupportedChainId.HECO_TESTNET]: 'HECO Testnet',
  [SupportedChainId.OEC_MAINNET]: 'OEC Mainnet',
  [SupportedChainId.OEC_TESTNET]: 'OEC Testnet',
  [SupportedChainId.POLYGON_MAINNET]: 'Polygon Mainnet',
  [SupportedChainId.POLYGON_TESTNET]: 'Polygon Testnet',

  [SupportedELFChainId.MAINNET]: 'MainChain AELF',
  [SupportedELFChainId.tDVV]: 'SideChain tDVV',
  [SupportedELFChainId.tDVW]: 'SideChain tDVW',
};
export const ACTIVE_CHAIN: any = {
  [SupportedChainId.MAINNET]: 'Ethereum',
  [SupportedChainId.KOVAN]: 'Kovan',
  [SupportedChainId.BSC_MAINNET]: 'BSC Mainnet',
  [SupportedChainId.BSC_TESTNET]: 'BSC Testnet',
  [SupportedChainId.HECO_MAINNET]: 'HECO Mainnet',
  [SupportedChainId.HECO_TESTNET]: 'HECO Testnet',
  [SupportedChainId.OEC_MAINNET]: 'OEC Mainnet',
  [SupportedChainId.OEC_TESTNET]: 'OEC Testnet',
  [SupportedChainId.POLYGON_MAINNET]: 'Polygon Mainnet',
  [SupportedChainId.POLYGON_TESTNET]: 'Polygon Testnet',

  [SupportedELFChainId.MAINNET]: 'AELF Mainnet',
  [SupportedELFChainId.tDVV]: 'AELF tDVV',
  [SupportedELFChainId.tDVW]: 'AELF tDVW',
};
export const PROD_CHAIN: { [key: number]: string } = {
  [SupportedChainId.MAINNET]: 'Ethereum',
  [SupportedChainId.BSC_MAINNET]: 'BSC Mainnet',
};
// TODO 测试数据
export const API_CHAINID: { [chainId in CHAIN_ID_TYPE]: string } = {
  [SupportedChainId.MAINNET]: '39fe4c85-b8d1-fe5e-a765-1bfdfc86ac7e',
  [SupportedChainId.KOVAN]: 'a0d24361-4c65-11ec-8a36-0e839de1b313',
  [SupportedChainId.BSC_MAINNET]: '39fe4c85-e62b-50da-f7b1-b7a0493b6d2e',
  [SupportedChainId.BSC_TESTNET]: 'a5702b0b-4c65-11ec-8a36-0e839de1b313',
  [SupportedChainId.HECO_MAINNET]: '39fe4c86-1f60-14dd-e400-8683893f75cf',
  [SupportedChainId.HECO_TESTNET]: 'a922077b-4c65-11ec-8a36-0e839de1b313',
  [SupportedChainId.OEC_MAINNET]: 'TODO',
  [SupportedChainId.OEC_TESTNET]: 'TODO',
  [SupportedChainId.POLYGON_MAINNET]: 'TODO',
  [SupportedChainId.POLYGON_TESTNET]: 'TODO',
  [SupportedELFChainId.MAINNET]: '52e1457d-d062-11ec-a698-fa163e0b1a8f',
  [SupportedELFChainId.tDVV]: '1ddac557-9bc6-11ec-a14b-0ee50f750b74',
  [SupportedELFChainId.tDVW]: '1ddac557-9bc6-11ec-a14b-0ee50f750b74',
};

export const NetworkContextName = 'NETWORK';

// native token info
export const NATIVE_TOKEN_SYMBOL = 'AWAKEN';
// export const NATIVE_TOKEN_DECIMAL = 18;
// lp token default decimals
// export const SALP_DECIMALS = 18;

export const EXTRA_DIVIDEND_SYMBOL = 'USDT';
//user unlogin default address
export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000';

//lending
export const PRICE_FEED_DECIMALS = 18;
export const EXCHANGE_RATE_DECIMALS = 8;

const prodNetworkList = [
  {
    title: CHAIN_NAME[SupportedELFChainId.tDVV],
    info: AELF_tDVV.CHAIN_INFO,
  },
];

const testnetNetWorkList = [
  {
    title: CHAIN_NAME[SupportedELFChainId.tDVW],
    info: AELF_tDVW.CHAIN_INFO,
  },
];

const testNetworkList = [
  {
    title: CHAIN_NAME[SupportedELFChainId.tDVV],
    info: AELF_tDVV.CHAIN_INFO,
  },
];

export const networkList = (() => {
  switch (API_ENV) {
    case 'local':
    case 'test':
      return testNetworkList;
    case 'preview':
      return testnetNetWorkList;
    default:
      return prodNetworkList;
  }
})();

export const currentDividendSymbol: string | undefined = '';
