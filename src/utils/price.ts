import BigNumber from 'bignumber.js';
import { ZERO } from 'constants/misc';
import isShowUSD from './isShowUSD';

const ONE_THOUSAND = new BigNumber(1000);
const ONE_MILLION = new BigNumber(1000000);
const ONE_BILLION = new BigNumber(1000000000);
const ONE_TRILLION = new BigNumber(1000000000000);

export function formatPriceUSD(price?: BigNumber.Value, digits = 2): string {
  if (!isShowUSD()) {
    return '';
  }

  if (!price) {
    return ZERO.toString();
  }
  const bigNum = new BigNumber(price);

  if (bigNum.gte(ONE_TRILLION)) {
    return formatTrillion(price);
  }

  if (bigNum.gte(ONE_BILLION)) {
    return formatBillion(bigNum);
  }

  if (bigNum.gte(ONE_MILLION)) {
    return formatMillion(bigNum);
  }

  if (bigNum.gte(0.1)) {
    return bigNum.dp(2).toString();
  }

  return bigNum.dp(digits).toString();
}

export function formatPriceUSDWithSymBol(price?: BigNumber.Value, prefix?: string, subfix?: string): string {
  if (!isShowUSD()) {
    return '-';
  }

  return `${prefix ?? ''}$${formatPrice(price)}${subfix ?? ''}`;
}

export function formatPrice(price?: BigNumber.Value, digits = 4): string {
  if (!price) {
    return ZERO.toString();
  }
  const bigNum = new BigNumber(price);

  if (bigNum.gte(ONE_TRILLION)) {
    return formatTrillion(price);
  }

  if (bigNum.gte(ONE_BILLION)) {
    return formatBillion(bigNum);
  }

  if (bigNum.gte(ONE_MILLION)) {
    return formatMillion(bigNum);
  }

  if (bigNum.gte(10)) {
    return bigNum.dp(2).toString();
  }

  if (bigNum.gte(1)) {
    return bigNum.dp(4).toString();
  }

  return bigNum.dp(digits).toString();
}

export function formatTokenAmount(num?: BigNumber.Value, digits = 4) {
  if (!num) {
    return ZERO.toString();
  }
  const bigNum = new BigNumber(num);

  if (bigNum.gte(ONE_TRILLION)) {
    return formatTrillion(bigNum);
  }

  if (bigNum.gte(ONE_BILLION)) {
    return formatBillion(bigNum);
  }

  if (bigNum.gte(ONE_MILLION)) {
    return formatMillion(bigNum);
  }

  if (bigNum.gte(ONE_THOUSAND)) {
    return formatThousand(bigNum);
  }

  if (bigNum.gte(0.1)) {
    return bigNum.toFixed(2);
  }

  return bigNum.dp(digits).toString();
}

export function formatPriceChange(price?: BigNumber.Value, digits = 12): string {
  if (!price) {
    return ZERO.toString();
  }

  const bigNum = new BigNumber(price);

  if (digits === 0) return bigNum.dp(digits).toString();

  if (bigNum.gte(10)) {
    return bigNum.dp(2).toString();
  }

  if (bigNum.gte(1)) {
    return bigNum.dp(4).toString();
  }

  return bigNum.dp(digits).toString();
}

export function formatPriceChangeSD(price?: BigNumber.Value, digits = 12): string {
  if (!price) {
    return ZERO.toString();
  }
  const bigNum = new BigNumber(price);

  if (bigNum.gte(10)) {
    return bigNum.dp(2).toString();
  }

  if (bigNum.gte(1)) {
    return bigNum.dp(4).toString();
  }

  return bigNum.sd(digits).toString();
}

export function formatLiquidity(price?: BigNumber.Value, digits = 7): string {
  if (!price) {
    return ZERO.toString();
  }
  const bigNum = new BigNumber(price);
  if (bigNum.gte(ONE_BILLION)) {
    return formatBillion(bigNum);
  }

  if (bigNum.gte(ONE_MILLION)) {
    return formatMillion(bigNum);
  }

  return bigNum.dp(digits).toString();
}

export function formatBalance(price?: BigNumber.Value): string {
  if (!price) {
    return ZERO.toString();
  }
  const bigNum = new BigNumber(price);
  return bigNum.toFormat(8);
}

export function formatPercentage(price?: BigNumber.Value): string {
  if (!price) {
    return ZERO.toString();
  }

  return formatPriceByStringToFix(price, 2);
}

export function formatPriceByNumberToFix(price?: BigNumber.Value, digits = 2): number {
  if (!price) {
    return 0;
  }

  const bigNum = new BigNumber(price);
  return new BigNumber(bigNum.toFixed(digits)).toNumber();
}

export function formatPriceByStringToFix(price?: BigNumber.Value, digits = 2): string {
  if (!price) {
    return '';
  }

  const bigNum = new BigNumber(price);
  return bigNum.toFormat(digits);
}

export function formatPriceByNumberToDp(price?: BigNumber.Value, digits = 2): number {
  if (!price) {
    return 0;
  }

  const bigNum = new BigNumber(price);
  return bigNum.dp(digits).toNumber();
}

export function formatPriceByStringToDp(price?: BigNumber.Value, digits = 2): string {
  if (!price) {
    return '';
  }

  const bigNum = new BigNumber(price);
  return bigNum.dp(digits).toString();
}

export function formatThousand(price?: BigNumber.Value): string {
  if (!price) {
    return ZERO.toString();
  }
  return `${new BigNumber(price).div(ONE_THOUSAND).toFixed(2)}K`;
}

export function formatMillion(price?: BigNumber.Value): string {
  if (!price) {
    return ZERO.toString();
  }
  return `${new BigNumber(price).div(ONE_MILLION).toFixed(2)}M`;
}

export function formatBillion(price?: BigNumber.Value): string {
  if (!price) {
    return ZERO.toString();
  }
  return `${new BigNumber(price).div(ONE_BILLION).toFixed(2)}B`;
}

export function formatTrillion(price?: BigNumber.Value): string {
  if (!price) {
    return ZERO.toString();
  }

  if (new BigNumber(price).gte(ONE_TRILLION.times(1000))) {
    return '>999T';
  }

  return `${new BigNumber(price).div(ONE_TRILLION).toFixed(2)}T`;
}
