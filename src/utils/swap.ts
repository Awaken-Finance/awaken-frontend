import { Currency, ELFChainToken } from '@awaken/sdk-core';
import BigNumber from 'bignumber.js';
import { ChainConstants } from 'constants/ChainConstants';
import { divDecimals, timesDecimals, valueToPercentage } from './calculate';
import { Inputs, Reserves, Tokens } from 'types/swap';
import storages from 'storages';
import { DEFAULT_EXPIRATION, DEFAULT_SLIPPAGE_TOLERANCE } from 'constants/swap';
import { Outputs, RemoveOutputs } from 'types/swap';
import notification from './notification';
import {
  ALLOWED_PRICE_IMPACT_LOW,
  ALLOWED_PRICE_IMPACT_MEDIUM,
  ALLOWED_PRICE_IMPACT_HIGH,
  BLOCKED_PRICE_IMPACT_NON_EXPERT,
  ZERO,
  ONE,
  PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN,
} from 'constants/misc';
import { TFunction } from 'react-i18next';
import { PBTimestamp } from 'types/aelf';
import { A_TOKEN_PREFIX } from 'constants/aelf';
import { isElfChainSymbol } from './aelfUtils';
import { getLog } from './protoUtils';
import getTransactionId, { getLogs } from './contractResult';
import { formatSwapError } from './formatError';
export const getDeadline = (): number | PBTimestamp => {
  const deadline = new BigNumber(JSON.parse(localStorage.getItem(storages.userExpiration) || ''));
  const seconds =
    Math.ceil(new Date().getTime() / 1000) +
    (!deadline.isNaN() ? deadline.times(60).toNumber() : Number(DEFAULT_EXPIRATION) * 60);
  if (ChainConstants.chainType === 'ELF') return { seconds: seconds, nanos: 0 };
  return seconds;
};

export const quote = (amountA?: BigNumber, reserveA?: BigNumber | string, reserveB?: BigNumber | string): BigNumber => {
  if (!(amountA && reserveB && reserveA)) return ZERO;
  return amountA.times(reserveB).div(reserveA);
};
export const getAmount = (
  amountA?: BigNumber | string,
  reserveA?: BigNumber | string,
  reserveB?: BigNumber | string,
): BigNumber => {
  if (!(amountA && reserveA && reserveB)) return ZERO;
  const BAmount = BigNumber.isBigNumber(amountA) ? amountA : new BigNumber(amountA);
  return BAmount.times(reserveB).div(reserveA);
};
export const getLiquidityAmount = (
  liquidity?: BigNumber | string,
  reserve?: BigNumber | string,
  totalSupply?: BigNumber | string,
): BigNumber => {
  if (!(liquidity && reserve && totalSupply)) return ZERO;
  const BLiquidity = BigNumber.isBigNumber(liquidity) ? liquidity : new BigNumber(liquidity);
  return BLiquidity.times(reserve).div(totalSupply);
};

export const getLiquidity = (
  amount?: BigNumber | string,
  reserve?: BigNumber | string,
  totalSupply?: BigNumber | string,
): BigNumber => {
  if (!(amount && reserve && totalSupply)) return ZERO;
  const BAmount = BigNumber.isBigNumber(amount) ? amount : new BigNumber(amount);
  return BAmount.times(totalSupply).div(reserve);
};

export const getCurrencyAddress = (token?: Currency) => {
  if (token?.isToken) return token.address;
  if (token?.isELFChain) return token.symbol;
  return '';
};

export const getEstimatedShare = ({
  inputs,
  tokens,
  reserves,
}: {
  inputs?: Inputs;
  tokens?: Tokens;
  reserves?: Reserves;
}) => {
  let max = ZERO;
  // const obj: any = {};
  Object.entries(tokens || {}).forEach(([k, token]) => {
    if (!token) return;
    const input = inputs?.[k];
    const amount = timesDecimals(input, token.decimals);
    const reserve = reserves?.[k];
    const shard = amount.div(amount.plus(reserve || 0)).times(100);
    max = max.lt(shard) ? shard : max;
    // obj[k] = amount.div(amount.plus(reserve || 0)).times(100);
  });
  const res = max.toNumber();
  return res < 0.01 && res > 0 ? '<0.01' : max.dp(2).toFixed();
};

export const getPairTokenRatio = ({
  tokenA,
  tokenB,
  reserves,
}: {
  tokenA?: Currency;
  tokenB?: Currency;
  reserves?: Reserves;
}) => {
  const denominator = divDecimals(reserves?.[getCurrencyAddress(tokenA)], tokenA?.decimals);
  const radio = divDecimals(reserves?.[getCurrencyAddress(tokenB)], tokenB?.decimals).div(denominator);
  return denominator.isZero() || radio.isNaN() ? '0' : radio.toFixed();
};
export function inputToSide(molecular: string | BigNumber, denominator: string | BigNumber) {
  const m = BigNumber.isBigNumber(molecular) ? molecular : new BigNumber(molecular);
  const n = m.div(denominator).times(100);
  return BigNumber.min(100, n.isNaN() ? 0 : n);
}

export function sideToInput(side: number, total: string | BigNumber) {
  const t = BigNumber.isBigNumber(total) ? total : new BigNumber(total);
  return t.times(side).div(100);
}

export function bigNumberToString(big: BigNumber, decimals?: number) {
  return big.isNaN() ? '0' : big.dp(decimals ?? 18).toString();
}
export function bigNumberToUPString(big: BigNumber, decimals?: number) {
  return big.isNaN() ? '0' : big.dp(decimals ?? 18, BigNumber.ROUND_UP).toString();
}

/**
 * output = (input * R_out * 1000) / ((R_In - input) * (100 - fee) * 10)
 */
export const getAmountByInput = (fee: string, amountIn: BigNumber, reserveIn: BigNumber, reserveOut: BigNumber) => {
  const fe = new BigNumber(100).minus(fee).times(10);

  const molecular = amountIn.times(reserveOut).times(1000);
  const denominator = reserveIn.minus(amountIn).times(fe);

  return molecular.div(denominator);
};

/**
 * inA1 = a1 * (1 - feeRate)
 * a2 = (inA1 * r2) / (r1 + inA1)
 */
export const getAmountOut = (
  fee: string,
  amountIn: BigNumber,
  reserveIn: BigNumber,
  reserveOut: BigNumber,
): BigNumber => {
  const fe = new BigNumber(100).minus(fee).times(10);
  const amountInWithFee = amountIn.times(fe);

  const numerator = amountInWithFee.times(reserveOut);
  const denominator = reserveIn.times(1000).plus(amountInWithFee);

  return numerator.div(denominator);
};

export const getPriceImpact = (
  fee: string,
  amountOut: BigNumber | undefined,
  reserveOut?: BigNumber | string,
): BigNumber => {
  if (!amountOut || !reserveOut) return ZERO;
  const fe = new BigNumber(100).minus(fee).div(100);
  return amountOut.times(fe).div(reserveOut).times(100);
};

export const getPriceImpactWithBuy = (
  reserveA: BigNumber,
  reserveB: BigNumber,
  total: BigNumber | string,
  output: BigNumber,
): BigNumber => {
  if (!reserveA || !reserveB || !total) return ZERO;

  const prePro = reserveB.div(reserveA);

  const bigTotal = new BigNumber(total);
  const numerator = reserveB.plus(bigTotal);
  const denominator = reserveA.minus(output);

  return numerator.div(denominator).minus(prePro).div(prePro).times(100);
};

export const getPriceImpactWithSell = (
  reserveA: BigNumber,
  reserveB: BigNumber,
  input: BigNumber | string,
  output: BigNumber,
): BigNumber => {
  if (!reserveA || !reserveB || !input) return ZERO;
  const prePro = reserveB.div(reserveA);

  const bigInput = new BigNumber(input);
  const numerator = reserveB.minus(output);
  const denominator = reserveA.plus(bigInput);

  return numerator.div(denominator).minus(prePro).div(prePro).times(100);
};

export function parseUserSlippageTolerance(input?: string) {
  return valueToPercentage(input || DEFAULT_SLIPPAGE_TOLERANCE);
}

export function getMinRate() {
  const slippageTolerance = JSON.parse(localStorage.getItem(storages.userSlippageTolerance) || '');
  return ONE.minus(parseUserSlippageTolerance(slippageTolerance).div(100));
}

type WithdrawalEvent = {
  returnValues: {
    wad: string;
  };
};
type SwapEvent = {
  returnValues: {
    amount0In: string;
    amount1In: string;
    amount0Out: string;
    amount1Out: string;
  };
};

type SwapResult = {
  transactionHash: string;
  events: {
    Withdrawal: WithdrawalEvent;
    Swap: SwapEvent;
  };
  TransactionId?: string;
  transactionId?: string;
};
// TODO
export async function swapSuccess({
  result,
  tokenB,
  tokenA,
  t,
}: {
  result: SwapResult;
  tokenA?: Currency;
  tokenB?: Currency;
  t: TFunction<'translation'>;
}) {
  const Logs = getLogs(result);
  const log = getLog(Logs, 'Swap');
  const { amountIn, amountOut, symbolIn, symbolOut } = log[0];
  try {
    const transactionId = getTransactionId(result);
    notification.successToExplorer(
      {
        message: t('swapSuccess'),
        description: t('swapSuccessDescription', {
          token1: `${divDecimals(amountIn, tokenB?.decimals).dp(8).toFixed()} ${symbolIn}`,
          token2: `${divDecimals(amountOut, tokenA?.decimals).dp(8).toFixed()} ${symbolOut}`,
        }),
        txId: transactionId,
      },
      t,
    );
  } catch (error: any) {
    formatSwapError(error, {
      amount: divDecimals(amountIn, tokenB?.decimals).dp(8).toFixed(),
      symbol: symbolIn,
    });
  }
}

type CurrencyBalances = { [key: string]: BigNumber };

export function checkAddButtonStatus({
  t,
  inputs,
  leftToken,
  rightToken,
  currencyBalances,
  pairAddress,
}: {
  t: TFunction<'translation'>;
  inputs?: Outputs;
  leftToken?: Currency;
  rightToken?: Currency;
  currencyBalances?: CurrencyBalances;
  pairAddress?: string;
}) {
  const leftInput = inputs?.[getCurrencyAddress(leftToken)];
  const rightInput = inputs?.[getCurrencyAddress(rightToken)];
  const leftBalance = divDecimals(currencyBalances?.[getCurrencyAddress(leftToken)], leftToken?.decimals);
  const rightBalance = divDecimals(currencyBalances?.[getCurrencyAddress(rightToken)], rightToken?.decimals);
  let text = pairAddress ? 'addLiquiditySupply' : 'addPairs',
    disabled = false;
  if (!leftToken || !rightToken) {
    text = 'selectAToken';
    disabled = true;
  } else if (leftInput && leftBalance.lt(leftInput)) {
    text = t('insufficientBalance', { symbol: leftToken.symbol });
    disabled = true;
  } else if (rightInput && rightBalance.lt(rightInput)) {
    text = t('insufficientBalance', { symbol: rightToken.symbol });
    disabled = true;
  } else if (
    !leftInput ||
    !rightInput ||
    ZERO.gte(leftInput) ||
    ZERO.gte(rightInput) ||
    ZERO.plus(leftInput).isNaN() ||
    ZERO.plus(rightInput).isNaN()
  ) {
    text = 'enterAmount';
    disabled = true;
  }
  return [text, disabled];
}

export function checkRemoveButtonStatus({
  inputs,
  leftToken,
  rightToken,
  pairAddress,
  showLpBalance,
}: {
  inputs?: RemoveOutputs;
  leftToken?: Currency;
  rightToken?: Currency;
  pairAddress?: string;
  showLpBalance: BigNumber;
}) {
  const leftInput = inputs?.[getCurrencyAddress(leftToken)];
  const rightInput = inputs?.[getCurrencyAddress(rightToken)];
  const lp = inputs?.lp;
  let text = 'remove',
    disabled = false;
  if (!leftToken || !rightToken) {
    text = 'selectAToken';
    disabled = true;
  } else if (!pairAddress) {
    text = 'pairNotExist';
    disabled = true;
  } else if (!leftInput || !rightInput || ZERO.gte(lp || 0) || ZERO.plus(lp || 0).isNaN()) {
    text = 'enterAmount2';
    disabled = true;
  } else if (lp && showLpBalance.lt(lp)) {
    text = 'insufficientBalanceLP';
    disabled = true;
  } else if (showLpBalance.lte(0)) {
    text = 'zeroBalanceLP';
    disabled = true;
  }
  return [text, disabled];
}

export function checkSwapButtonStatus({
  t,
  input,
  tokenA,
  tokenB,
  showBalance,
  reserves,
  isExpert,
  priceImpactSeverity,
  outPut,
  sell,
}: {
  t: TFunction<'translation'>;
  input?: string;
  tokenA?: Currency;
  tokenB?: Currency;
  showBalance: BigNumber;
  reserves?: Reserves;
  isExpert?: boolean;
  priceImpactSeverity: number;
  outPut: BigNumber;
  sell?: boolean;
}) {
  let text,
    disabled = true;
  if (!input) {
    text = t('Please enter the amount');
  } else if (!reserves || Object.values(reserves).filter((i) => ZERO.gte(i)).length === 2) {
    text = t('insufficientLiquidity');
  } else if (showBalance.lt(input || 0)) {
    text = t('exceedAvailableBalance');
  } else {
    let [prefixText, suffixText] = sell ? [t('sell'), tokenB?.symbol] : [t('buy'), tokenA?.symbol];
    // not isExpert
    if (!isExpert && priceImpactSeverity > 2) {
      if (priceImpactSeverity > 4) return [t('High Price Impact (Need expert mode)'), true];
      if (priceImpactSeverity > 3) {
        prefixText = t('High Price Impact(Swap Anyway)');
        suffixText = '';
      } else {
        prefixText = t('continue') + prefixText;
      }
    }

    if (tokenA && !outPut.isNaN() && outPut.dp(tokenA.decimals).lte(0))
      return [t('The entered value is too small'), true];

    if (tokenA && tokenB && input && !outPut.isNaN()) disabled = false;

    text = prefixText + suffixText;
  }
  return [text, disabled];
}

export function getCurrency(
  token: {
    address: string;
    symbol: string;
    decimals: number;
  },
  chainId: number | string,
) {
  const { symbol, decimals } = token || {};
  const checkedSymbol = isElfChainSymbol(symbol);
  if (typeof chainId === 'string' && checkedSymbol) {
    return new ELFChainToken(chainId, symbol, decimals, symbol, symbol);
  }
}

const IMPACT_TIERS = [
  BLOCKED_PRICE_IMPACT_NON_EXPERT,
  PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN,
  ALLOWED_PRICE_IMPACT_HIGH,
  ALLOWED_PRICE_IMPACT_MEDIUM,
  ALLOWED_PRICE_IMPACT_LOW,
];
type WarningSeverity = 0 | 1 | 2 | 3 | 4 | 5;
export function getPriceImpactSeverity(priceImpact?: string | BigNumber) {
  if (!priceImpact) return 4;
  let impact: WarningSeverity = IMPACT_TIERS.length as WarningSeverity;
  for (const impactLevel of IMPACT_TIERS) {
    if (impactLevel.lt(priceImpact)) return impact;
    impact--;
  }
  return 0;
}

export function minimumAmountOut(outputAmount: BigNumber, slippageTolerance = DEFAULT_SLIPPAGE_TOLERANCE) {
  return outputAmount.times(ONE.div(ONE.plus(slippageTolerance)));
}
export function sortLPSymbol(symbol: string) {
  const list = symbol?.split('-');
  return list?.sort().join('-');
}
export function getLPDecimals() {
  return ChainConstants.chainType === 'ELF' ? 8 : 18;
}
export function getLPSymbol(symbols: string | Currency[]) {
  if (Array.isArray(symbols)) return A_TOKEN_PREFIX + [symbols[0]?.symbol, symbols[1]?.symbol].sort().join('-');
  return A_TOKEN_PREFIX + symbols;
}
