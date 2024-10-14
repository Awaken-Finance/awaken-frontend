import { ChainConstants } from 'constants/ChainConstants';
import { SupportedChainId, SupportedELFChainId } from 'constants/chain';
import { Currency } from '@awaken/sdk-core';
import storages from 'storages';
import { EventEmitter } from 'events';
import { DEFAULT_CID } from 'constants/channel';
import { TokenInfo } from 'types';
import apiConfig from 'config/apiConfig';
export const eventBus = new EventEmitter();

export const toLowerCase = (address?: string): string => {
  if (address) {
    return address.toLocaleLowerCase();
  }
  return '';
};

export function shortenAddress(address: string | null, chars = 4): string {
  const parsed = address;
  if (!parsed) {
    throw Error(`Invalid 'address' parameter '${address}'.`);
  }
  // const end = ChainConstants.chainType === 'ELF' ? 50 : 42;
  return `${parsed.substring(0, chars)}...${parsed.substring(address.length - chars)}`;
}

export function shortenString(address: string | null, chars = 10): string {
  const parsed = address;
  if (!parsed) {
    return '';
  }
  return `${parsed.substring(0, chars)}...${parsed.substring(parsed.length - chars)}`;
}

export function shortenTransactionId(transactionId: string): string {
  if (transactionId.length <= 17) return transactionId;
  return `${transactionId.substring(0, 17)}...`;
}

export function getExploreLink(data: string, type: 'transaction' | 'token' | 'address' | 'block'): string {
  const prefix = apiConfig.explorer;
  switch (type) {
    case 'transaction': {
      return `${prefix}/tx/${data}`;
    }
    case 'token': {
      return `${prefix}/token/${data}`;
    }
    case 'block': {
      return `${prefix}/block/${data}`;
    }
    case 'address':
    default: {
      return `${prefix}/address/${data}`;
    }
  }
}

export const isEqAddress = (a1?: string, a2?: string) => {
  try {
    return a1?.toLocaleLowerCase() === a2?.toLocaleLowerCase();
  } catch (error) {
    return false;
  }
};

export function symbolUnify(symbol: string, chainId: number | string) {
  if ([56, 97].includes(chainId as number)) {
    return symbol === 'WBNB' ? 'BNB' : symbol;
  }
  return symbol === 'WETH' ? 'ETH' : symbol;
}

type Network = 'ethereum' | 'binance' | 'kovan' | 'AELF';

function chainIdToNetworkName(): Network {
  switch (ChainConstants.chainId) {
    case SupportedChainId.MAINNET:
      return 'ethereum';
    case SupportedChainId.BSC_MAINNET:
      return 'binance';
    case SupportedChainId.KOVAN:
      return 'kovan';
    case SupportedELFChainId.MAINNET:
    case SupportedELFChainId.tDVV:
    case SupportedELFChainId.tDVW:
      return 'AELF';
    default:
      return 'ethereum';
  }
}

const networksWithNativeUrls: any = [
  SupportedChainId.KOVAN,
  SupportedELFChainId.MAINNET,
  SupportedELFChainId.tDVV,
  SupportedELFChainId.tDVW,
];

export const getTokenLogoURLs = (address?: string) => {
  if (!address) return [];
  const networkName = chainIdToNetworkName();
  let repositories = 'trustwallet';
  if (networksWithNativeUrls.includes(ChainConstants.chainId)) repositories = 'Awaken-Finance';
  return [
    `https://raw.githubusercontent.com/${repositories}/assets/main/blockchains/${networkName}/assets/${address}/logo24@3x.png`,
  ];
};

export const getELFChainTokenURL = (symbol?: string) => {
  if (!symbol) return;
  const networkName = chainIdToNetworkName();
  return `https://raw.githubusercontent.com/Awaken-Finance/assets/main/blockchains/${networkName}/assets/${symbol}/logo24@3x.png`;
};

export function isEqCurrency(c1?: Currency, c2?: Currency) {
  // return c1 && c2 && c1?.equals(c2);
  return c1 && c2 && c1.symbol === c2.symbol && c1.chainId === c2.chainId;
}

export const unifyWTokenSymbol = (token?: TokenInfo) => {
  if (!token) return '';
  return token.symbol;
};

export function getCID() {
  return localStorage.getItem(storages.cid) || DEFAULT_CID;
}

export function isUserDenied(m: string) {
  return typeof m === 'string' && m.includes('User denied');
}

export const sleep = (time: number) => {
  return new Promise<'sleep'>((resolve) => {
    setTimeout(() => {
      resolve('sleep');
    }, time);
  });
};

/**
 * Returns true if the string value is zero in hex
 * @param hexNumberString
 */
export function isZero(hexNumberString: string) {
  return /^0x0*$/.test(hexNumberString);
}

export * from './converter';
export * from './input';

export const handleLoopFetch = async <T>({
  fetch,
  times = 0,
  interval = 1000,
  checkIsContinue,
  checkIsInvalid,
}: {
  fetch: () => Promise<T>;
  times?: number;
  interval?: number;
  checkIsContinue?: (param: T) => boolean;
  checkIsInvalid?: () => boolean;
}): Promise<T> => {
  try {
    const result = await fetch();
    if (checkIsContinue) {
      const isContinue = checkIsContinue(result);
      if (!isContinue) return result;
    } else {
      return result;
    }
  } catch (error) {
    const isInvalid = checkIsInvalid ? checkIsInvalid() : true;
    if (!isInvalid) throw new Error('fetch invalid');
    console.log('handleLoopFetch: error', times, error);
  }
  if (times === 1) {
    throw new Error('fetch exceed limit');
  }
  await sleep(interval);
  return handleLoopFetch({
    fetch,
    times: times - 1,
    interval,
    checkIsContinue,
    checkIsInvalid,
  });
};
