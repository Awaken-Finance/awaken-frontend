import { Currency, ERCToken, WETH9 } from '@awaken/sdk-core';
import { SupportedChainId } from 'constants/chain';
import { ExtendedEther } from 'constants/tokens';
import { LendingTokens } from 'types';
export const CHAIN_INFO = {
  chainId: 1,
  exploreUrl: 'https://etherscan.io/',
  rpcUrl: 'https://eth-mainnet.token.im',
};
export const BLOCK_PER_DAY = 6496;
export const BLOCK_PER_YEAR = BLOCK_PER_DAY * 365;
export const W_NATIVE_TOKEN_ADDRESS = '';

// swap common token list
const COMMON_BASES_LIST = [
  {
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    decimals: 18,
    symbol: 'DAI',
    name: 'Dai Stablecoin',
  },
  {
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    decimals: 6,
    symbol: 'USDC',
    name: 'USD//C',
  },
  {
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    decimals: 6,
    symbol: 'USDT',
    name: 'Tether USD',
  },
  {
    address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    decimals: 8,
    symbol: 'WBTC',
    name: 'Wrapped BTC',
  },
  WETH9[SupportedChainId.MAINNET],
];
export const COMMON_BASES: Currency[] = [
  ExtendedEther.onChain(SupportedChainId.MAINNET),
  ...COMMON_BASES_LIST.map((token) => {
    return new ERCToken(SupportedChainId.MAINNET, token.address, token.decimals, token.symbol, token.name);
  }),
];
export const FARM_PHASE2_ADDRESS = '0xb3C160feCa0500401d8c3E143198259fCa97b298';
export const FARM_PHASE1_ADDRESS = '';
export const DIVIDEND_CONTRACT_ADDRESS = '0x92fcc1fdaCf6bA6403d880dcf5CE0302c9248863';
export const IDO_ADDRESS = '0xa8d1234f118b16b7C02Af4DAe06c665c77097c69';

export const CHAIN_NATIVE_TOKEN_SYMBOL = 'ETH';

export const LOCK_EXCHANGE_ADDRESS = '';
export const ENS_REGISTRAR_ADDRESSES = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e';

// swap router
export const ROUTER: { [key: string]: string } = {};
// swap factory
export const FACTORY: { [key: string]: string } = {};

// for farm
export const FARM_USDT = '0x3c4b091c21a67b2097366ae167050ac42dcc90a4';
export const FARM_USDT_DECIMAL = 6;
export const FARM_AWKN = '0xa8ac0df092eb73fcab40d1df4fbfe9f1890764ed';

// for lending
export const COMPTROLLER = 'TODO';
export const MAXIMILLION = 'TODO';
export const PRICEFEED = 'TODO';
export const COMPOUNDLENS = 'TODO';
export const EXCHANGE_TOKEN_ADDRESS = 'TODO';
export const SL_SASHIMI = 'TODO';
export const SL_NATIVE_TOKEN = 'TODO';
export const LENDING_TOKENS: LendingTokens = {};

export const NATIVE_TOKEN_ADDRESS = 'string';

export const SWAP_TOKEN_ASSETS_DATA = {
  startTime: 1637139600,
  stakeEndTime: 1637218800,
  endTime: 1637748000,
  LockingRate: 1.06,
};
export const IDO_ASSETS_DATA = {
  PID: '7',
  idoRate: '0.05',
};

export const DIVIDEND_ASSETS_DATA = {
  PID: '0',
};

export const NATIVE_TOKEN_DECIMAL = 18;
export const SALP_DECIMALS = 18;
