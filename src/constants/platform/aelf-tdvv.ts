import { Currency, ELFChainToken } from '@awaken/sdk-core';
import { SupportedELFChainId } from 'constants/chain';
import { SupportedSwapRate } from 'constants/swap';
import { LendingTokens } from 'types';

export const CHAIN_INFO = {
  chainId: 'tDVV',
  exploreUrl: 'https://tdvv-explorer.aelf.io/',
  rpcUrl: 'https://tdvv-public-node.aelf.io',
};
export const LOGIN_INFO = {
  chainId: 'tDVV',
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
        contractAddress: '2jum27zBSxb7gw21Pkxu2M4ZkLdRdyYpSsTUxkBeBNDaun1QA6',
        contractName: 'IDO contract',
        description: 'You can invest, etc.',
        github: '-',
      },
    ],
  },
};

export const LP_TOKEN_CONTRACT = 'VZCyHSPayr4PPyHqDKUTSbpR2o7MJgjXkHqMUVv9SEbTYoWqw';

export const TOKEN_CONTRACT = '7RzVGiuVWkvL4VfVHdZfQF2Tri3sgLe9U991bohHFfSRZXuGX';

export const IDO_ADDRESS = 'ZaLtsjGhzZ2KP9UEm4ABN3XgMT8DgV8q6BQJgpKHuyrfwit4c';
export const FARM_PHASE1_ADDRESS = 'JvDB3rguLJtpFsovre8udJeXJLhsV1EPScGz2u1FFneahjBQm';
export const FARM_PHASE2_ADDRESS = '2b7Gf7YqVmjhZXir7uehmZoRwsYo1KNFTo9JDZiiByxPBQS1d8';

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
    name: 'BTETE',
    symbol: 'BTETE',
    decimals: 8,
  },
  {
    name: 'USDTE',
    symbol: 'USDTE',
    decimals: 6,
  },
];

export const COMMON_BASES: Currency[] = [
  ...COMMON_BASES_LIST.map((token) => {
    return new ELFChainToken(SupportedELFChainId.tDVV, '', token.decimals, token.symbol, token.name);
  }),
];

export const DIVIDEND_CONTRACT_ADDRESS = 'C7ZUPUHDwG2q3jR5Mw38YoBHch2XiZdiK6pBYkdhXdGrYcXsb';

export const CHAIN_NATIVE_TOKEN_SYMBOL = 'ELF';

export const LOCK_EXCHANGE_ADDRESS = '0xb7C980957774B6e821801BC07AF1B1CDb169F2F6';

export const ENS_REGISTRAR_ADDRESSES = '';

// swap router
export const ROUTER: { [key: string]: string } = {
  [SupportedSwapRate.percent_0_05]: '83ju3fGGnvQzCmtjApUTwvBpuLQLQvt5biNMv4FXCvWKdZgJf',
  [SupportedSwapRate.percent_0_3]: 'JvDB3rguLJtpFsovre8udJeXJLhsV1EPScGz2u1FFneahjBQm',
  [SupportedSwapRate.percent_1]: 'hyiwdsbDnyoG1uZiw2JabQ4tLiWT6yAuDfNBFbHhCZwAqU1os',
  [SupportedSwapRate.percent_3]: '2q7NLAr6eqF4CTsnNeXnBZ9k4XcmiUeM61CLWYaym6WsUmbg1k',
  [SupportedSwapRate.percent_5]: 'UYdd84gLMsVdHrgkr3ogqe1ukhKwen8oj32Ks4J1dg6KH9PYC',
};

// swap factory
export const FACTORY: { [key: string]: string } = {
  [SupportedSwapRate.percent_0_05]: '2b7Gf7YqVmjhZXir7uehmZoRwsYo1KNFTo9JDZiiByxPBQS1d8',
  [SupportedSwapRate.percent_0_3]: '2AJXAXSwyHbKTHQhKFiaYozakUUQDeh3xrHW9FGi3vYDMBjtiS',
  [SupportedSwapRate.percent_1]: '25CkLPA8qwDRGQci2kFg77i6pZXVivvX4DHW78i1B7rPHdBkoK',
  [SupportedSwapRate.percent_3]: '2PwfVguYDmYcpJVPmoH9doEpBgd8L28NCcUDiuq77CzvEWzuKZ',
  [SupportedSwapRate.percent_5]: '2eJ4MnRWFo7YJXB92qj2AF3NWoB3umBggzNLhbGeahkwDYYLAD',
};
// for farm
export const FARM_USDT = '0x3C4b091C21a67B2097366ae167050aC42dcc90A4';
export const FARM_USDT_DECIMAL = 6;
export const FARM_AWKN = '0xE0E9B64A7b04F97E9E34cE60bbDE938E8F518873';
// for lending
export const COMPTROLLER = 'mhgUyGhd27YaoG8wgXTbwtbAiYx7E59n5GXEkmkTFKKQTvGnB';
export const ATOKEN = 'x4CTSuM8typUbpdfxRZDTqYVa42RdxrwwPkXX7WUJHeRmzE6k';
export const MAXIMILLION = '25TyYPmWgQVSjAG3FnTn1quWCbKgvbFpBxTPnoDkK2xSUtNBey';
// testPriceAddress
export const PRICEFEED = 'SBrGAmBong8tmou3EKHgKkUoqpvEUrPNuBtpF9yc3QA1r9SKL';
export const COMPOUNDLENS = 'XmQ59e3JxmtP5gGafNFyJQAF5A2WbtVDYXFVv3JEaKMckyb3b';

export const EXCHANGE_TOKEN_ADDRESS = '0x7a76b4082599CB073ead2aB2297b0867113AA27c';
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
  MAXIMILLION,
  PRICEFEED,
  COMPOUNDLENS,
  ATOKEN,

  IDO_ADDRESS,
  FARM_PHASE1_ADDRESS,
  FARM_PHASE2_ADDRESS,
  DIVIDEND_CONTRACT_ADDRESS,
].map((i) => {
  EXPAND_CONTRACTS[i] = i;
});
export const CONTRACTS = {
  ...EXPAND_CONTRACTS,
};
