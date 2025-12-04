import { Currency, ERCToken, NativeCurrency, WETH9 } from '@awaken/sdk-core';
import { NativeToken, SupportedChainId } from './chain';
import invariant from 'tiny-invariant';

export const CHAIN_NATIVE_TOKEN: {
  [chainId in SupportedChainId]: NativeToken;
} = {
  [SupportedChainId.MAINNET]: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  [SupportedChainId.KOVAN]: {
    decimals: 18,
    name: 'Kovan',
    symbol: 'ETH',
  },
  [SupportedChainId.BSC_MAINNET]: {
    decimals: 18,
    name: 'BSC Mainnet',
    symbol: 'BNB',
  },
  [SupportedChainId.BSC_TESTNET]: {
    decimals: 18,
    name: 'BSC Testnet',
    symbol: 'BNB',
  },
  [SupportedChainId.HECO_MAINNET]: {
    decimals: 18,
    name: 'HECO Mainnet',
    symbol: 'HT',
  },
  [SupportedChainId.HECO_TESTNET]: {
    decimals: 18,
    name: 'HECO Testnet',
    symbol: 'HT',
  },
  [SupportedChainId.OEC_MAINNET]: {
    decimals: 18,
    name: 'OEC Mainnet',
    symbol: 'OKT',
  },
  [SupportedChainId.OEC_TESTNET]: {
    decimals: 18,
    name: 'OEC Testnet',
    symbol: 'OKT',
  },
  [SupportedChainId.POLYGON_MAINNET]: {
    decimals: 18,
    name: 'POLYGON Mainnet',
    symbol: 'MATIC',
  },
  [SupportedChainId.POLYGON_TESTNET]: {
    decimals: 18,
    name: 'POLYGON Testnet',
    symbol: 'MATIC',
  },
};
export class Ether extends NativeCurrency {
  protected constructor(chainId: number | string) {
    const { name, decimals, symbol } = CHAIN_NATIVE_TOKEN[chainId as SupportedChainId];
    super(chainId, decimals || 18, symbol || 'ETH', name || 'Ether');
  }

  public get wrapped(): ERCToken {
    const weth9 = WETH9[this.chainId];
    invariant(!!weth9, 'WRAPPED');
    return weth9;
  }

  private static _etherCache: { [chainId: number]: Ether } = {};

  public static onChain(chainId: number): Ether {
    return this._etherCache[chainId] ?? (this._etherCache[chainId] = new Ether(chainId));
  }

  public equals(other: Currency): boolean {
    return other.isNative && other.chainId === this.chainId;
  }
}

export class ExtendedEther extends Ether {
  private static _cachedEther: { [SupportedChainId: number]: ExtendedEther } = {};

  public static onChain(SupportedChainId: number): ExtendedEther {
    return (
      this._cachedEther[SupportedChainId] ?? (this._cachedEther[SupportedChainId] = new ExtendedEther(SupportedChainId))
    );
  }
}
