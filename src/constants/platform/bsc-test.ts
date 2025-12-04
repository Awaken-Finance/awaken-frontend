import { Currency } from '@awaken/sdk-core';
import { SupportedChainId } from 'constants/chain';
import { SupportedSwapRate } from 'constants/swap';
import { ExtendedEther } from 'constants/tokens';
import { LendingTokens } from 'types';

export const CHAIN_INFO = {
  chainId: 97,
  rpcUrl: 'https://data-seed-prebsc-1-s2.binance.org:8545',
  // rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545',
  ethscanType: '',
  exploreUrl: 'https://testnet.bscscan.com/',
  chainSymbol: 'BSC',
  chainName: 'Binance Smart Chain Testnet',
  nativeCurrency: {
    name: 'Binance Chain Native Token',
    symbol: 'tBNB',
    decimals: 18,
  },
  rpcUrls: ['https://data-seed-prebsc-1-s2.binance.org:8545'],
  blockExplorerUrls: ['https://testnet.bscscan.com/'],
  iconUrls: ['https://etherscan.io/token/images/bnb_28_2.png'],
};

export const BLOCK_PER_DAY = 28800;
export const BLOCK_PER_YEAR = BLOCK_PER_DAY * 365;
export const W_NATIVE_TOKEN_ADDRESS = '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd';
export const COMMON_BASES: Currency[] = [ExtendedEther.onChain(SupportedChainId.BSC_TESTNET)];
export const FARM_PHASE2_ADDRESS = '0x12A068e22Bd9491637E4dBd1C0bbDCCC8B6e07DA';
export const FARM_PHASE1_ADDRESS = '0xE1A65aB0C52b2C6Ec2feC9038135D6C9DFef511b';
export const DIVIDEND_CONTRACT_ADDRESS = '0x92fcc1fdaCf6bA6403d880dcf5CE0302c9248863';
export const IDO_ADDRESS = '0x1E30D14353181296E2a0624E925350d86fCD71C2';

export const CHAIN_NATIVE_TOKEN_SYMBOL = 'BSC';

export const LOCK_EXCHANGE_ADDRESS = '0xaca02d0bfbf53e37e6a39a1ab92484e188d7a84f';
export const ENS_REGISTRAR_ADDRESSES = '';

// swap router
export const ROUTER: { [key: string]: string } = {
  [SupportedSwapRate.percent_0_05]: '0x0a4f60fe19f54A7200Cb132DD3CA29eC2c8BDdCF',
  [SupportedSwapRate.percent_0_3]: '0xdbbB8A48494C4D7174280A62780bd2ad5E42Ef84',
  [SupportedSwapRate.percent_1]: '0x5E07B61FE3Ac55615408d173DE957f94b6Ae04b4',
  [SupportedSwapRate.percent_3]: '0x525d4f424Aea6770EF0Da234C94762da8490f58e',
  [SupportedSwapRate.percent_5]: '0xA54fbd75905BFFB7e60B3d7f98a9666939E110E7',
};

// swap factory
export const FACTORY: { [key: string]: string } = {
  [SupportedSwapRate.percent_0_05]: '0xFb0c66A076F8169Ba78D239348AEF1327F2C2E0e',
  [SupportedSwapRate.percent_0_3]: '0xc0d9aFF711C9AaA89b35655f9Cbdf2A5a01420B4',
  [SupportedSwapRate.percent_1]: '0x3d9777aA860bB6E275c58eBd94ca91C8d7e2F632',
  [SupportedSwapRate.percent_3]: '0x437DC4677681F48235D616B577aF15e8c2349139',
  [SupportedSwapRate.percent_5]: '0x44cE6Cab293C0ab4d8D43F52Bef4247a00c5fEa3',
};
// for farm
export const FARM_USDT = '';
export const FARM_USDT_DECIMAL = 18;
export const FARM_AWKN = '';

// for lending
export const COMPTROLLER = '0x0e0bd2f6AC6d3644c52C908392973B404Cfb6EC2';
export const MAXIMILLION = '0x307e5C324F5C8A3d9aE4aFAccdaAFD3A02dC4577';
export const PRICEFEED = '0x11Cca67E8E44fA9D9dbCaF180C20518C89DB9Af0';
export const COMPOUNDLENS = '0x6C7B9511F2e437101876A62615378Fce6Fdb6e7B';
export const EXCHANGE_TOKEN_ADDRESS = '0xf217395e5cf46334bf04cbd0dd57822cab7f902b';
export const SL_SASHIMI = '0x7c009318652Cc22d7143D1F0c11b60D668CAD3e2';
// slBNB
export const SL_NATIVE_TOKEN = '0x5FfB9A8AA366cf260EA26ad6bC7799E2414d02eC';

export const LENDING_TOKENS: LendingTokens = {
  BNB: {
    address: '',
    decimals: 18,
  },
  SASHIMI: {
    address: '0xFCB644FF1872412bff732dE4F2EBB5fa4F27f0C1',
    decimals: 18,
  },
  ETH: {
    address: '0x86b8AC6E084B8fF4E851716Ca8c3F8E5BAdb099e',
    decimals: 18,
  },
  USDT: {
    address: '0x3F280eE5876CE8B15081947E0f189E336bb740A5',
    decimals: 18,
  },
  slETH: {
    address: '0x2bEB6a7A0D4e49548666E90F71aDCd862Be68cd6',
    decimals: 8,
  },
  slSASHIMI: {
    address: '0x7c009318652Cc22d7143D1F0c11b60D668CAD3e2',
    decimals: 8,
  },
  slUSDT: {
    address: '0x70023dcF721Fe4c478d14DA65A5F92e487D5ff31',
    decimals: 8,
  },
  slBNB: {
    address: '0x5FfB9A8AA366cf260EA26ad6bC7799E2414d02eC',
    decimals: 8,
  },
};

export const NATIVE_TOKEN_ADDRESS = '0x20d94fb914beE2F04C196b8E9E1F4fd7858348C7';

export const SWAP_TOKEN_ASSETS_DATA = {
  startTime: 1637579433,
  stakeEndTime: 1637580033,
  endTime: 1637580153,
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
