import BigNumber from 'bignumber.js';

// used for warning states
export const ALLOWED_PRICE_IMPACT_LOW: BigNumber = new BigNumber(1).div(100); // 1%
export const ALLOWED_PRICE_IMPACT_MEDIUM: BigNumber = new BigNumber(3).div(100); // 3%
export const ALLOWED_PRICE_IMPACT_HIGH: BigNumber = new BigNumber(5).div(100); // 5%
// if the price slippage exceeds this number, force the user to type 'confirm' to execute
export const PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN: BigNumber = new BigNumber(10).div(100); // 10%
// for non expert mode disable swaps above this
export const BLOCKED_PRICE_IMPACT_NON_EXPERT: BigNumber = new BigNumber(15).div(100); // 15%

export const ZERO = new BigNumber(0);
export const ONE = new BigNumber(1);

export const VALUE_M = new BigNumber(1000);
export const VALUE_B = new BigNumber(1000000);
export const VALUE_T = new BigNumber(1000000000);

export const isNanOrZero = (val: any) => new BigNumber(val).isNaN() || new BigNumber(val).eq(0);

export const LANG_MAX = new BigNumber('9223372036854774784');

export enum REQ_CODE {
  UserDenied = -1,
  Fail = -2,
  Success = 1,
}

export const SYMBOL_FORMAT_MAP: Record<string, string> = {
  'SGR-1': 'SGR',
};

export const LP_DECIMALS = 8;
export const LANG_MAX_VALUE = LANG_MAX.toFixed();

export const TOKEN_SORT_MAP: Record<string, string> = {
  ELF: LANG_MAX.toFixed(),
  USDT: LANG_MAX.minus(1).toFixed(),
};

export const SWAP_TIME_INTERVAL = 30 * 1000;

export const MOBILE_DEVICE_WIDTH = 640;
