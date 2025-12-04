import { Currency, ELFChainToken } from '@awaken/sdk-core';
import { SupportedELFChainId } from 'constants/chain';
import { SupportedSwapRate } from 'constants/swap';
import { LendingTokens } from 'types';

export const CHAIN_INFO = {
  chainId: 'tDVW',
  exploreUrl: 'http://192.168.66.216:8000/swagger/index.html?',
  rpcUrl: 'http://192.168.66.216:8000',
};
export const LOGIN_INFO = {
  chainId: 'tDVW',
  payload: {
    method: 'LOGIN',
    contracts: [
      {
        chainId: 'AELF',
        contractAddress: 'JRmBduh4nXWi1aXgdUsj5gJrzeZb2LxmrAbf7W99faZSvoAaE',
        contractName: 'Token contract',
        description: 'You can transfer, approve, get balance, etc.',
        github: 'https://github.com/AElfProject/AElf/blob/dev/protobuf/token_contract.proto',
      },
      {
        chainId: 'AELF',
        contractAddress: 'ZaLtsjGhzZ2KP9UEm4ABN3XgMT8DgV8q6BQJgpKHuyrfwit4c',
        contractName: 'IDO contract',
        description: 'You can invest, etc.',
        github: '-',
      },
    ],
  },
};

export const LP_TOKEN_CONTRACT = 'VZCyHSPayr4PPyHqDKUTSbpR2o7MJgjXkHqMUVv9SEbTYoWqw';

export const TOKEN_CONTRACT = 'ASh2Wt7nSEmYqnGxPPzp4pnVDU4uhj1XW9Se5VeZcX2UDdyjx';

export const IDO_ADDRESS = 'ZaLtsjGhzZ2KP9UEm4ABN3XgMT8DgV8q6BQJgpKHuyrfwit4c';
export const FARM_PHASE1_ADDRESS = '2GQyjP9FC9wFinsU86g5XxJGmGoXUbWr11PJXoeCw76ZX96oTm';
export const FARM_PHASE2_ADDRESS = '8PPu6eqvhWbAvfjZyN8ZScBoTbh1qTn8v2vFUcaTuUU9uMGBX';

export const IDO_ASSETS_DATA = {
  PID: 6,
};

export const BLOCK_PER_DAY = 172800;
export const BLOCK_PER_YEAR = BLOCK_PER_DAY * 365;
export const W_NATIVE_TOKEN_ADDRESS = '0xA050886815CFc52a24B9C4aD044ca199990B6690';

const COMMON_BASES_LIST = [
  {
    name: 'ELF',
    symbol: 'ELF',
    decimals: 8,
  },
  {
    name: 'BTC',
    symbol: 'BTC',
    decimals: 8,
  },
  {
    name: 'USDT',
    symbol: 'USDT',
    decimals: 6,
  },
];
export const COMMON_BASES: Currency[] = [
  ...COMMON_BASES_LIST.map((token) => {
    return new ELFChainToken(SupportedELFChainId.tDVW, '', token.decimals, token.symbol, token.name);
  }),
];

export const DIVIDEND_CONTRACT_ADDRESS = 'fspRcxRW1138vKLFCShqCvoF1RLHEEtyARZ41xZycSfCCkrqQ';

export const CHAIN_NATIVE_TOKEN_SYMBOL = 'USDT';

export const LOCK_EXCHANGE_ADDRESS = '0xb7C980957774B6e821801BC07AF1B1CDb169F2F6';

export const ENS_REGISTRAR_ADDRESSES = '';

// swap router swap
export const ROUTER: { [key: string]: string } = {
  [SupportedSwapRate.percent_0_05]: '8rGPzbQCDkMS4f2je7VxNUxGGwgcdUQcoBNwesCoqaGWmR9oB',
  [SupportedSwapRate.percent_0_3]: 'JQkVTWz5HXxEmNXzTtsAVHC7EUTeiFktzoFUu9TyA6MWngkem',
  [SupportedSwapRate.percent_1]: '2KPGMPMgusmR4Vs9FbtHmvNuikpkUfCwrK5CTANv9N4gU9fTNx',
  [SupportedSwapRate.percent_3]: '2VZL7cJVJ15QEq6gMfaavNcqMrfqVJZGMdHkiufFCEef4j9uhT',
  [SupportedSwapRate.percent_5]: '2Fj68191s7sXByetJUf6bcnKoUxvo2nz1kmVu4HEku4a6aLEMJ',
};

// swap factory token
export const FACTORY: { [key: string]: string } = {
  [SupportedSwapRate.percent_0_05]: '2F4vThkqXxzoUGQowUzmGNQwyGc6a6Ca7UZK5eWHpwmkwRuUpN',
  [SupportedSwapRate.percent_0_3]: '2KTbzgSh6jGBr7PfgoESfmm9GPVtt8ac57pDQyQmR8YoZ6td2g',
  [SupportedSwapRate.percent_1]: '2KRHY1oZv5S28YGRJ3adtMxfAh7WQP3wmMyoFq33oTc7Mt5Z1Y',
  [SupportedSwapRate.percent_3]: 'UoHeeCXZ6fV481oD3NXASSexWVtsPLgv2Wthm3BGrPAgqdS5d',
  [SupportedSwapRate.percent_5]: '2tWvBTmX7YhB2HLcWGGG5isVCgab96jdaXnqDs1jzSsyqwmjic',
};
// for farm
export const FARM_USDT = '0x3C4b091C21a67B2097366ae167050aC42dcc90A4';
export const FARM_USDT_DECIMAL = 6;
export const FARM_AWKN = '0xE0E9B64A7b04F97E9E34cE60bbDE938E8F518873';
// for lending
export const COMPTROLLER = 'BccynWpUwq9xFzWzRpNs94NUZZjmin976aAvk827SSKVDP2hy';
export const ATOKEN = '2WAwJ7LhhsPZNfktLXyY9afU35YhX6LVkae7icnaKpjS7Xi6ME';
// elf need not
export const MAXIMILLION = '25TyYPmWgQVSjAG3FnTn1quWCbKgvbFpBxTPnoDkK2xSUtNBey';
// testPriceAddress
export const PRICEFEED = '2eELq9W73D485jtHuSgUEpP9Zw6VKR3KefdKarEqbXMkNKKaQZ';
export const COMPOUNDLENS = '2WgFMBTR8hv8f3bc6UDdGJHEkmLHwVSFGoKzBUfFTpC6jeQPS7';

export const EXCHANGE_TOKEN_ADDRESS = '0x7a76b4082599CB073ead2aB2297b0867113AA27c';
// elf need not
export const SL_SASHIMI = '0xAeF179a6D05C30CADE1b62cAe52F98C3166986c3';
// slETH
export const SL_NATIVE_TOKEN = '0xDDc52341f28EC30B574Eb6aAf36EBAa36191A829';

export const LENDING_TOKENS: LendingTokens = {
  SLELF: {
    address: 'LonCeGQP3p7tEMntM8d368HMNLUQzNKcjcT1fUjM7gZxS3P9J',
    decimals: 8,
  },
  SLLLL: {
    address: 'G3ijoXFqTPve5K2kfoL1iEctixSyXm3ZQhFGS1ppc2jH2B7ED',
    decimals: 8,
  },
  SLMMM: {
    address: 'r1xVQCRaSk5QbqHsHvZxbbjyB3rHP3XqK5UFzKN9KKvhWJwBa',
    decimals: 8,
  },
  SLTEST: {
    address: 'Kp9kXxNqkm9ZdpT6qPjTD1NpBoe16C7VDyZ6qo9oGX4wy6YrC',
    decimals: 8,
  },
  SLUSDT: {
    address: '2CYSHxyU6NLxo2YFQr5TSxWxkhzbkEmiZsd5At8AeYR8FWbbL3',
    decimals: 8,
  },
  ELF: {
    address: '22TJFH5jtHwctka5R1BYFFNCuTEcZraHGgXhNCuwfzHFDRbTeZ',
    decimals: 8,
  },
  LLL: {
    address: 'gLXoV2WJmVnr1ZX342LUXKJXYjd1XPufhcFsWeqEarXi4Pto8',
    decimals: 10,
  },
  MMM: {
    address: '2XZhCHSikMqFg4kUtLvxD2eYc48tV3pGLEYdaxrwxDaB9eJkKP',
    decimals: 8,
  },
  TEST: {
    address: 'LBkp3RCVVVSjVesa7YarEn1bqGSGiX2QrvMxnbowjKosF3E5s',
    decimals: 8,
  },
  USDT: {
    address: 'ZYRTqrkA9yvPsxH1Fa5rLGetuyjcAQkmZ7yMaHL2rM4gPrP7j',
    decimals: 6,
  },
};

export const NATIVE_TOKEN_ADDRESS = '0xE0E9B64A7b04F97E9E34cE60bbDE938E8F518873';

export const SWAP_TOKEN_ASSETS_DATA = {
  startTime: 1637139600,
  stakeEndTime: 1637218800,
  endTime: 1637748000,
  LockingRate: 1.06,
};

export const DIVIDEND_ASSETS_DATA = {
  PID: '0',
};

export const NATIVE_TOKEN_DECIMAL = 8;
export const SALP_DECIMALS = 8;
const EXPAND_CONTRACTS: any = {};
[
  ...Object.values(ROUTER),
  ...Object.values(FACTORY),
  TOKEN_CONTRACT,

  // lending
  COMPTROLLER,
  // MAXIMILLION,
  PRICEFEED,
  COMPOUNDLENS,
  ATOKEN,

  FARM_PHASE1_ADDRESS,
  FARM_PHASE2_ADDRESS,
  DIVIDEND_CONTRACT_ADDRESS,
].map((i) => {
  EXPAND_CONTRACTS[i] = i;
});
export const CONTRACTS = {
  ...EXPAND_CONTRACTS,
};
