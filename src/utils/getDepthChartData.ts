import BigNumber from 'bignumber.js';
import { ONE } from 'constants/misc';
import { getAmountOut } from './swap';
export interface DetailInfo {
  changes: string;
  token0Volume: string;
  token1Volume: string;
}
export interface Depth {
  ask: {
    a: string;
    p: string;
    detail: DetailInfo;
  }[];
  bid: {
    a: string;
    p: string;
    detail: DetailInfo;
  }[];
}
/**
 *  Pair：Token0/Token1
 *
 *  X axis： Can buy token0 number
 *  Y axis： price
 *
 *  Calculate on Y axis
 *    ：Token1's current price can buy = (Math.sqrt (P transaction price / P current price)-1) * XToken number
 *    ：
 */

// function getYs(
//   Token0: number,
//   Token1: number,
//   currentPrice: number,
//   price: number,
// ) {
//   const data = getDepthPriceFormulaByPrice(currentPrice, price, Token0);
//   return new BigNumber(Token1).minus(
//     new BigNumber(Token0).times(Token1).div(new BigNumber(Token0).plus(data)),
//   );
// }

/**
 *
 * @param currentPrice
 * @param price
 * @param Token0
 * @returns // △ Count
 */

function getDepthPriceFormulaByPrice(currentPrice: number, price: number, Token: number) {
  return new BigNumber(price).div(currentPrice).sqrt().minus(1).times(Token);
}

export default function getDepthChartData(
  currentPrice: number,
  Token0: number,
  Token1: number,
  percentFeeRate: number,
) {
  let i = 0;
  let upPrice = currentPrice;
  let downPrice = currentPrice;
  const token0Arr = [];
  const token1Arr = [];
  const fees = new BigNumber(percentFeeRate).div(100).plus(ONE);

  const UpScale = new BigNumber(currentPrice).times(0.5).div(500).toNumber();
  while (i < 500) {
    const token1VolumeUp = getDepthPriceFormulaByPrice(currentPrice, upPrice, Token1).toFixed();
    const token0VolumeUp = getAmountOut(
      percentFeeRate.toString(),
      new BigNumber(token1VolumeUp),
      new BigNumber(Token1),
      new BigNumber(Token0),
    ).toFixed();
    token0Arr.push({
      a: token0VolumeUp,
      p: new BigNumber(upPrice).times(fees).toFixed(),
      detail: {
        changes: new BigNumber(upPrice).minus(currentPrice).div(currentPrice).times(100).toFixed(2),
        token0Volume: token0VolumeUp,
        token1Volume: token1VolumeUp,
      },
    });

    const token0VolumeDown = getDepthPriceFormulaByPrice(1 / currentPrice, 1 / downPrice, Token0).toFixed();

    const token1VolumeDown = getAmountOut(
      percentFeeRate.toString(),
      new BigNumber(token0VolumeDown),
      new BigNumber(Token0),
      new BigNumber(Token1),
    ).toFixed();

    token1Arr.push({
      a: token0VolumeDown,
      p: new BigNumber(downPrice).times(fees).toFixed(),
      changes: new BigNumber(downPrice).minus(currentPrice).div(currentPrice).times(100).toFixed(2),
      detail: {
        changes: new BigNumber(downPrice).minus(currentPrice).div(currentPrice).times(100).toFixed(2),
        token0Volume: token0VolumeDown,
        token1Volume: token1VolumeDown,
      },
    });
    upPrice += UpScale;
    downPrice -= UpScale;
    i++;
  }
  return { ask: token0Arr, bid: token1Arr };
}
