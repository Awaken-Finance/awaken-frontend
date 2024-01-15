// const AAVE_LIST = 'tokenlist.aave.eth';
// const BA_LIST = 'https://raw.githubusercontent.com/The-Blockchain-Association/sec-notice-list/master/ba-sec-list.json';
// const CMC_ALL_LIST = 'defi.cmc.eth';
// const CMC_STABLECOIN = 'stablecoin.cmc.eth';
// const COINGECKO_LIST = 'https://tokens.coingecko.com/uniswap/all.json';
// const COMPOUND_LIST = 'https://raw.githubusercontent.com/compound-finance/token-list/master/compound.tokenlist.json';
// const GEMINI_LIST = 'https://www.gemini.com/uniswap/manifest.json';
// const KLEROS_LIST = 't2crtokens.eth';
// const OPTIMISM_LIST = 'https://static.optimism.io/optimism.tokenlist.json';
// const ROLL_LIST = 'https://app.tryroll.com/tokens.json';
// const SET_LIST = 'https://raw.githubusercontent.com/SetProtocol/uniswap-tokenlist/main/set.tokenlist.json';
// const WRAPPED_LIST = 'wrapped.tokensoft.eth';
// const PANCAKE_EXTENDED = 'https://tokens.pancakeswap.finance/pancakeswap-extended.json';
// const PANCAKE_TOP100 = 'https://tokens.pancakeswap.finance/pancakeswap-top-100.json';
const API_ENV = process.env.REACT_APP_API_ENV;
const AWAKEN_LIST_MAP: { [key: string]: string } = {
  local:
    'https://raw.githubusercontent.com/Awaken-Finance/default-token-list/main/build/awaken-default.tokenlist.tdvv.json',
  test: 'https://raw.githubusercontent.com/Awaken-Finance/default-token-list/main/build/awaken-default.tokenlist.tdvv.json',
  preview:
    'https://raw.githubusercontent.com/Awaken-Finance/default-token-list/main/build/awaken-default.tokenlist.tdvw.json',
  main: 'https://raw.githubusercontent.com/Awaken-Finance/default-token-list/main/build/awaken-default.tokenlist.aelf.json',
};

const AWAKEN_LIST = AWAKEN_LIST_MAP[API_ENV || 'main'];

export const UNSUPPORTED_LIST_URLS: string[] = [AWAKEN_LIST];

// lower index == higher priority for token import
export const DEFAULT_LIST_OF_LISTS: string[] = [
  // COMPOUND_LIST,
  // AAVE_LIST,
  // CMC_ALL_LIST,
  // CMC_STABLECOIN,
  // WRAPPED_LIST,
  // SET_LIST,
  // ROLL_LIST,
  // COINGECKO_LIST,
  // KLEROS_LIST,
  // OPTIMISM_LIST,
  // GEMINI_LIST,
  // PANCAKE_EXTENDED,
  // PANCAKE_TOP100,
  ...UNSUPPORTED_LIST_URLS, // need to load unsupported tokens as well
];
// default lists to be 'active' aka searched across
export const DEFAULT_ACTIVE_LIST_URLS: string[] = [AWAKEN_LIST];
