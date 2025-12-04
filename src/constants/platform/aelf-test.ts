import { Currency, ELFChainToken } from '@awaken/sdk-core';
import { SupportedELFChainId } from 'constants/chain';
import { SupportedSwapRate } from 'constants/swap';
import { LendingTokens } from 'types';

export const CHAIN_INFO = {
  chainId: 'AELF',
  exploreUrl: 'https://explorer.aelf.io/',
  rpcUrl: 'http://172.25.127.105:8000',
};
export const LOGIN_INFO = {
  chainId: 'AELF',
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
        contractAddress: 'SsSqZWLf7Dk9NWyWyvDwuuY5nzn5n99jiscKZgRPaajZP5p8y',
        contractName: 'IDO contract',
        description: 'You can invest, etc.',
        github: '-',
      },
    ],
  },
};

export const LP_TOKEN_CONTRACT = '2LUmicHyH4RXrMjG4beDwuDsiWJESyLkgkwPdGTR8kahRzq5XS';

export const TOKEN_CONTRACT = 'JRmBduh4nXWi1aXgdUsj5gJrzeZb2LxmrAbf7W99faZSvoAaE';

export const IDO_ADDRESS = 'SsSqZWLf7Dk9NWyWyvDwuuY5nzn5n99jiscKZgRPaajZP5p8y';
export const FARM_PHASE1_ADDRESS = 'sr4zX6E7yVVL7HevExVcWv2ru3HSZakhsJMXfzxzfpnXofnZw';
export const FARM_PHASE2_ADDRESS = 'xsnQafDAhNTeYcooptETqWnYBksFGGXxfcQyJJ5tmu6Ak9ZZt';

export const IDO_ASSETS_DATA = {
  PID: 8,
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
    name: 'ETH',
    symbol: 'ETH',
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
    return new ELFChainToken(SupportedELFChainId.MAINNET, '', token.decimals, token.symbol, token.name);
  }),
];

export const DIVIDEND_CONTRACT_ADDRESS = 'Q366dydKCzhydty758uzqaBQAXPRdMYaQETrrEUS9LQHfAxof';

export const CHAIN_NATIVE_TOKEN_SYMBOL = 'ELF';

export const LOCK_EXCHANGE_ADDRESS = '0xb7C980957774B6e821801BC07AF1B1CDb169F2F6';

export const ENS_REGISTRAR_ADDRESSES = '';

// swap router
export const ROUTER: { [key: string]: string } = {
  [SupportedSwapRate.percent_0_05]: '2NxwCPAGJr4knVdmwhb1cK7CkZw5sMJkRDLnT7E2GoDP2dy5iZ',
  [SupportedSwapRate.percent_0_3]: '2WHXRoLRjbUTDQsuqR5CntygVfnDb125qdJkudev4kVNbLhTdG',
};

// swap factory
export const FACTORY: { [key: string]: string } = {
  [SupportedSwapRate.percent_0_05]: '2RHf2fxsnEaM3wb6N1yGqPupNZbcCY98LgWbGSFWmWzgEs5Sjo',
  [SupportedSwapRate.percent_0_3]: '2LUmicHyH4RXrMjG4beDwuDsiWJESyLkgkwPdGTR8kahRzq5XS',
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
