import BigNumber from 'bignumber.js';
import { ONE, ZERO } from 'constants/misc';
import isShowUSD from './isShowUSD';

const ONE_THOUSAND = new BigNumber(1000);
const ONE_MILLION = new BigNumber(1000000);
const ONE_BILLION = new BigNumber(1000000000);
const ONE_TRILLION = new BigNumber(1000000000000);

export function formatPriceUSD(price?: BigNumber.Value, digits = 12): string {
  if (!isShowUSD()) {
    return '';
  }

  if (!price) {
    return ZERO.toString();
  }
  const bigNum = new BigNumber(price);

  if (bigNum.isNaN()) return '0';

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
    return bigNum.dp(2, BigNumber.ROUND_DOWN).toString();
  }

  return bigNum.dp(digits).precision(3, BigNumber.ROUND_DOWN).toString();
}

export function formatPriceUSDWithSymBol(price?: BigNumber.Value, prefix = '', suffix = ''): string {
  if (!isShowUSD()) {
    return '';
  }

  return `${prefix}$${formatPriceUSD(price, 3)}${suffix}`;
}

export function formatPriceUSDSplit(price: BigNumber.Value) {
  const bigNum = new BigNumber(price);
  console.log(price, bigNum, 'bigNum==');
  if (bigNum.isNaN()) return { p: '0' };

  if (bigNum.gte(0.1)) return { p: formatPriceUSD(price, 3) };
  return formatNumber(price, 12, 3);
}

export function formatPrice(price?: BigNumber.Value, digits = 12): string {
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

  return bigNum.dp(digits).precision(4).toString();
}

const OMIT_ZERO_DIGITS = 6;

const formatNumber = (
  value: BigNumber.Value,
  digits = 12,
  last = 4,
): {
  p: string;
  o?: string;
  m?: string;
} => {
  const n = new BigNumber(value);

  if (n.e === null || n.e === null) return { p: '0' };

  const zeros = ONE.plus(n.e).abs();
  if (zeros.gte(digits)) return { p: '0' };

  if (zeros.lt(OMIT_ZERO_DIGITS))
    return {
      p: n.dp(digits).precision(last).toString(),
    };

  const o = zeros.minus(1);

  const lastNumber = n.c?.join('');
  // const last = ZERO.plus(digits).minus(o).minus(1).toNumber();
  const m = lastNumber?.slice(0, last);
  return {
    p: '0.0',
    o: o.toString(),
    m,
  };
};

export const getPriceScale = (price: BigNumber.Value, max = 12) => {
  const bigNum = new BigNumber(price);
  if (bigNum.gte(10)) return 2;
  if (bigNum.gte(1e-4)) return 4;
  const { e } = bigNum;
  if (!e) return 4;
  const d = ONE.plus(e).abs().toNumber() + 4;
  if (d > max) return 12;
  return d;
};

export function formatPriceSplit(price: BigNumber.Value = 0, digits = 12) {
  const bigNum = new BigNumber(price);
  if (bigNum.gte(1)) return { p: formatPrice(price, digits) };
  return formatNumber(price, digits);
}

export function formatTokenAmount(num?: BigNumber.Value, digits?: number) {
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

  // NFT
  if (digits === 0) {
    return bigNum.toFixed(0);
  }

  if (bigNum.gte(0.1)) {
    return bigNum.toFixed(2);
  }

  return bigNum.dp(digits ?? 4).toString();
}

export function formatPriceChange(price?: BigNumber.Value, digits = 12): string {
  if (!price) {
    return ZERO.toString();
  }

  const bigNum = new BigNumber(price);
  if (bigNum.isNaN()) return '0';

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

export function formatLiquidity(price?: BigNumber.Value, digits = 8): string {
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
