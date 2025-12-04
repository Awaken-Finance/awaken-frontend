import { Currency, ERCToken, WETH9 } from '@awaken/sdk-core';
import { SupportedChainId } from 'constants/chain';
import { ExtendedEther } from 'constants/tokens';
import { SupportedSwapRate } from 'constants/swap';
import { LendingTokens } from 'types';

export const CHAIN_INFO = {
  chainId: 42,
  exploreUrl: 'https://kovan.etherscan.io/',
  rpcUrl: 'https://kovan.infura.io/v3/ce7347e0c06b45658edecd760583dd27',
};
export const BLOCK_PER_DAY = 21600;
export const BLOCK_PER_YEAR = BLOCK_PER_DAY * 365;
export const W_NATIVE_TOKEN_ADDRESS = '0xA050886815CFc52a24B9C4aD044ca199990B6690';

const COMMON_BASES_LIST = [WETH9[SupportedChainId.KOVAN]];

export const COMMON_BASES: Currency[] = [
  ExtendedEther.onChain(SupportedChainId.KOVAN),
  ...COMMON_BASES_LIST.map((token) => {
    return new ERCToken(SupportedChainId.KOVAN, token.address, token.decimals, token.symbol, token.name);
  }),
];

export const FARM_PHASE2_ADDRESS = '0xFbd151F0d2C6Eb7BD62c01b5CD07890C5eACb2AE';
export const FARM_PHASE1_ADDRESS = '0xA44f2ada1728daD59D6c8C06Ed007013BdF66467';
export const DIVIDEND_CONTRACT_ADDRESS = '0x2733Eb9dE5a79CF0d82f193E5E1dA841393B4798';
export const IDO_ADDRESS = '0xc194e8603c29C5e149590AFC972635A10C59cf9b';

export const CHAIN_NATIVE_TOKEN_SYMBOL = 'ETH';

export const LOCK_EXCHANGE_ADDRESS = '0xb7C980957774B6e821801BC07AF1B1CDb169F2F6';

export const ENS_REGISTRAR_ADDRESSES = '';

// swap router
export const ROUTER: { [key: string]: string } = {
  [SupportedSwapRate.percent_0_05]: '0xc2BF4B596F2c8bf09f598023F5F3e991DA35d29a',
  [SupportedSwapRate.percent_0_3]: '0xE5d75556aCb7c8c24B6549CB5d3b88b071110E73',
  [SupportedSwapRate.percent_1]: '0x08281F873CE483912b08848ce564dC94EaeD32Bf',
  [SupportedSwapRate.percent_3]: '0x95ecAf2fdF02111a52eDaF78A9b30968C5D9e6eD',
  [SupportedSwapRate.percent_5]: '0x18a7a9cf4f485C38ffE9732851dD0231d8f85a06',
};

// swap factory
export const FACTORY: { [key: string]: string } = {
  [SupportedSwapRate.percent_0_05]: '0xeE4704768062b24BEc79D7BdD51D0ccCd7F01D2e',
  [SupportedSwapRate.percent_0_3]: '0xB5b52317c5E0314B1b8Ab972DDAC7a6877e65a79',
  [SupportedSwapRate.percent_1]: '0xD878Fae2b1eF52Ed019835953e95CE5599cE000C',
  [SupportedSwapRate.percent_3]: '0x95ecAf2fdF02111a52eDaF78A9b30968C5D9e6eD',
  [SupportedSwapRate.percent_5]: '0x18a7a9cf4f485C38ffE9732851dD0231d8f85a06',
};
// for farm
export const FARM_USDT = '0x3C4b091C21a67B2097366ae167050aC42dcc90A4';
export const FARM_USDT_DECIMAL = 6;
export const FARM_AWKN = '0xE0E9B64A7b04F97E9E34cE60bbDE938E8F518873';
// for lending
export const COMPTROLLER = '0xa82F129d71939a2592B14b17f0927Ef3D566C67c';
export const MAXIMILLION = '0x65A6F7be713d165f9Db49D6135bCC38CFf55d93E';
export const PRICEFEED = '0xBCf6a6239B0415C06bee08378c3BC8D14EB367cd';
export const COMPOUNDLENS = '0x9C1FdA11253C49CE65B36266d01cf393ceB025B4';
export const EXCHANGE_TOKEN_ADDRESS = '0x7a76b4082599CB073ead2aB2297b0867113AA27c';
export const SL_SASHIMI = '0xAeF179a6D05C30CADE1b62cAe52F98C3166986c3';
// slETH
export const SL_NATIVE_TOKEN = '0xDDc52341f28EC30B574Eb6aAf36EBAa36191A829';
export const LENDING_TOKENS: LendingTokens = {
  ETH: {
    address: '',
    decimals: 18,
  },
  DAI: {
    address: '0x13F90Ab146df35fe8685fDed6bfd969bB5f8F17F',
    decimals: 18,
  },
  WBTC: {
    address: '0x2E0a68203FA35E45B456cbb00F7744A44b43Bc0C',
    decimals: 8,
  },
  SASHIMI: {
    address: '0x4986843fde2b0dae6bdc54c8e16567614ea8786f',
    decimals: 18,
  },
  USDC: {
    address: '0xBCE1c2ad576b28Ae6bDc1fA4dBA6a9130598Cd7b',
    decimals: 6,
  },
  USDT: {
    address: '0x3C4b091C21a67B2097366ae167050aC42dcc90A4',
    decimals: 6,
  },
  GOF: {
    address: '0x02a76fe5B81cC6cC42C4eA7c91EeFC5171ed947B',
    decimals: 18,
  },
  ELF: {
    address: '0xB5685232b185cAdF7C5F58217722Ac40BC4ec45e',
    decimals: 18,
  },
  slETH: {
    address: '0xDDc52341f28EC30B574Eb6aAf36EBAa36191A829',
    decimals: 8,
  },
  slDAI: {
    address: '0x713b81dF7c2c7756d74Cd962Af5D1658a386A43e',
    decimals: 8,
  },
  slSASHIMI: {
    address: '0xAeF179a6D05C30CADE1b62cAe52F98C3166986c3',
    decimals: 8,
  },
  slUSDT: {
    address: '0xd882836033581a67deCAcDD93e16C8Ae62B6CEb1',
    decimals: 8,
  },
  slUSDC: {
    address: '0xbA4877bd40F6624920b2D2d842009f193F7B6C3b',
    decimals: 8,
  },
  slGOF: {
    address: '0x6643a5637764a65Aa458A017F1B2fe0cF28AF8E8',
    decimals: 8,
  },
  slELF: {
    address: '0x0c18e5c128866ee48131338789EE3a0AA5AE1Cf5',
    decimals: 8,
  },
  slWBTC: {
    address: '0x8470603D5b1E275adE11D1cB3a183B1E8CE7F577',
    decimals: 8,
  },
};

export const NATIVE_TOKEN_ADDRESS = '0xE0E9B64A7b04F97E9E34cE60bbDE938E8F518873';

export const SWAP_TOKEN_ASSETS_DATA = {
  startTime: 1637139600,
  stakeEndTime: 1637218800,
  endTime: 1637748000,
  LockingRate: 1.06,
};

export const IDO_ASSETS_DATA = {
  PID: '2',
  idoRate: '0.05',
};

export const DIVIDEND_ASSETS_DATA = {
  PID: '0',
};

export const NATIVE_TOKEN_DECIMAL = 18;
export const SALP_DECIMALS = 18;
