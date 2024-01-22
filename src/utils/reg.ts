/* eslint-disable no-useless-escape */

const URL_REG = /(https?:\/\/|www\.)[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&\/\/=]*)/i;
export function isUrl(url: string) {
  return URL_REG.test(url);
}

const SYMBOL_REG = /^[A-Za-z0-9\-]+$/;
export function isSymbol(symbol: string) {
  return SYMBOL_REG.test(symbol);
}

// const P_N_REG = /^[0-9]+.?[0-9]*$/;
const P_N_REG = /^(0|([1-9][0-9]*))(\.[0-9]*)?$/;

export function isValidNumber(n: string) {
  if (n.includes('-')) return false;
  return P_N_REG.test(n);
}
