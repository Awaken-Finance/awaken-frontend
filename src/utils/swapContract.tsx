import { Currency } from '@awaken/sdk-core';
import BigNumber from 'bignumber.js';
import { bigNumberToWeb3Input, divDecimals, timesDecimals } from './calculate';
import { Inputs } from 'types/swap';
import { getCurrencyAddress, getDeadline, getLPDecimals, getMinRate, swapSuccess } from './swap';
import notification from './notification';
import { getCID, isUserDenied } from 'utils';
import { ChainConstants } from 'constants/ChainConstants';
import { PBTimestamp } from 'types/aelf';
import { REQ_CODE, ZERO } from 'constants/misc';
import { IContract } from 'types';
import getTransactionId from './contractResult';
import { TFunction } from 'react-i18next';
import { formatSwapError } from './formatError';
import { isZeroDecimalsNFT } from './NFT';
import { TContractSwapToken } from 'pages/Swap/types';

type addLiquidityTokensProps = {
  tokenA: string;
  amountA: BigNumber;
  tokenB: string;
  amountB: BigNumber;
  account: string;
  routerContract: IContract;
  t: TFunction<'translation'>;
};
export const addLiquidityTokens: (param: addLiquidityTokensProps) => Promise<boolean | any> = async ({
  tokenA,
  amountA,
  tokenB,
  amountB,
  account,
  routerContract,
  t,
}) => {
  const contract = routerContract;
  const minRate = getMinRate();
  const amountAMin = amountA.times(minRate);
  const amountBMin = amountB.times(minRate);
  const args = [
    tokenA,
    tokenB,
    bigNumberToWeb3Input(amountA),
    bigNumberToWeb3Input(amountB),
    bigNumberToWeb3Input(amountAMin),
    bigNumberToWeb3Input(amountBMin),
    account,
    getDeadline(),
    getCID(),
  ];
  console.log(args, '========addLiquidity');
  const result = await contract.callSendMethod('addLiquidity', account, args);
  console.log(result, '========addLiquidity result');
  if (result.error) {
    notification.error({
      message: t('AddLiquidityFailed'),
    });
    if (isUserDenied(result.error.message)) return REQ_CODE.UserDenied;
    return REQ_CODE.Fail;
  }
  notification.successToExplorer(
    {
      message: t('AddLiquiditySuccess'),
      txId: getTransactionId(result),
    },
    t,
  );
  return REQ_CODE.Success;
};

type addLiquidityProps = {
  tokenA?: Currency;
  tokenB?: Currency;
  inputs?: Inputs;
  routerContract: IContract;
  account: string;
  t: TFunction<'translation'>;
};
export const onAddLiquidity: (param: addLiquidityProps) => Promise<boolean | any> = async ({
  tokenA,
  tokenB,
  inputs,
  routerContract,
  account,
  t,
}) => {
  if (tokenA?.isNative || tokenB?.isNative) {
    throw new Error('Native token not support');
  } else if (tokenA?.isToken && tokenB?.isToken) {
    const tokenAddress = tokenA.address;
    const tokenBAddress = tokenB.address;
    const amountA = timesDecimals(inputs?.[tokenAddress], tokenA.decimals);
    const amountB = timesDecimals(inputs?.[tokenBAddress], tokenB.decimals);
    return await addLiquidityTokens({
      routerContract,
      tokenA: tokenAddress,
      tokenB: tokenBAddress,
      amountA,
      amountB,
      account,
      t,
    });
  } else if (tokenA?.isELFChain && tokenB?.isELFChain) {
    const symbolA = tokenA.symbol;
    const symbolB = tokenB.symbol;
    const amountA = timesDecimals(inputs?.[symbolA], tokenA.decimals);
    const amountB = timesDecimals(inputs?.[symbolB], tokenB.decimals);
    return await addLiquidityTokens({
      routerContract,
      tokenA: symbolA,
      tokenB: symbolB,
      amountA,
      amountB,
      account,
      t,
    });
  }
};
type removeLiquidityTokensProps = {
  tokenA: string;
  tokenB: string;
  liquidity: BigNumber;
  amountA: BigNumber;
  amountB: BigNumber;
  account: string;
  routerContract: IContract;
  t: TFunction<'translation'>;
  decimalsA?: number;
  decimalsB?: number;
};
export const removeLiquidityTokens: (param: removeLiquidityTokensProps) => Promise<boolean | any> = async ({
  tokenA,
  tokenB,
  amountA,
  liquidity,
  amountB,
  account,
  routerContract,
  t,
  decimalsA,
  decimalsB,
}) => {
  const contract = routerContract;
  const minRate = getMinRate();

  let amountAMin = amountA.times(minRate);
  let amountBMin = amountB.times(minRate);

  if (isZeroDecimalsNFT(decimalsA)) {
    amountAMin = amountA.times(minRate.minus(0.9));
    amountBMin = amountB.times(minRate.minus(0.9));
  }
  if (isZeroDecimalsNFT(decimalsB)) {
    amountAMin = amountA.times(minRate.minus(0.9));
    amountBMin = amountB.times(minRate.minus(0.9));
  }

  const args =
    ChainConstants.chainType === 'ELF'
      ? [
          tokenA,
          tokenB,
          bigNumberToWeb3Input(amountAMin),
          bigNumberToWeb3Input(amountBMin),
          bigNumberToWeb3Input(liquidity),
          account,
          getDeadline(),
        ]
      : [
          tokenA,
          tokenB,
          bigNumberToWeb3Input(liquidity),
          bigNumberToWeb3Input(amountAMin),
          bigNumberToWeb3Input(amountBMin),
          account,
          getDeadline(),
        ];
  const result = await contract.callSendMethod('removeLiquidity', account, args);
  if (result.error) {
    notification.error({
      message: t('RemoveLiquidityFailed'),
      description: result.error.message,
    });
    if (isUserDenied(result.error.message)) return REQ_CODE.UserDenied;
    return REQ_CODE.Fail;
  }
  notification.successToExplorer(
    {
      message: t('RemoveLiquiditySuccess'),
      txId: getTransactionId(result),
    },
    t,
  );
  return REQ_CODE.Success;
};
type removeLiquidityProps = {
  lpAddress: string;
  account: string;
  routerContract: IContract;
  tokenA?: Currency;
  tokenB?: Currency;
  inputs?: Inputs;
  awTokenAddress?: string;
  t: TFunction<'translation'>;
};
export const onRemoveLiquidity: (param: removeLiquidityProps) => Promise<boolean | any> = async ({
  account,
  routerContract,
  tokenA,
  tokenB,
  inputs,
  t,
}) => {
  const liquidity = timesDecimals(inputs?.['lp'], getLPDecimals());

  if (tokenA?.isToken && tokenB?.isToken) {
    const tokenAddress = tokenA.address;
    const tokenBAddress = tokenB.address;
    const amountA = timesDecimals(inputs?.[tokenAddress], tokenA.decimals);
    const amountB = timesDecimals(inputs?.[tokenBAddress], tokenB.decimals);
    return await removeLiquidityTokens({
      tokenA: tokenAddress,
      tokenB: tokenBAddress,
      liquidity,
      amountA,
      amountB,
      account,
      routerContract,
      t,
      decimalsA: tokenA.decimals,
      decimalsB: tokenB.decimals,
    });
  } else if (tokenA?.isELFChain && tokenB?.isELFChain) {
    const symbolA = tokenA.symbol;
    const symbolB = tokenB.symbol;
    const amountA = timesDecimals(inputs?.[symbolA], tokenA.decimals);
    const amountB = timesDecimals(inputs?.[symbolB], tokenB.decimals);
    return await removeLiquidityTokens({
      tokenA: symbolA,
      tokenB: symbolB,
      liquidity,
      amountA,
      amountB,
      account,
      routerContract,
      t,
      decimalsA: tokenA.decimals,
      decimalsB: tokenB.decimals,
    });
  }
};

type SwapProps = {
  account: string;
  routerContract: IContract;
  tokenA?: Currency;
  tokenB?: Currency;
  amountIn: BigNumber;
  amountOutMin: BigNumber;
  swapArgs?: any;
  methodName?: string;
  t: TFunction<'translation'>;
};

export const onSwap: (param: SwapProps) => Promise<boolean | any> = async ({
  amountIn,
  amountOutMin,
  account,
  routerContract,
  tokenA,
  tokenB,
  swapArgs,
  methodName: methodNameProp,
  t,
}) => {
  if (amountOutMin.lt(1)) amountOutMin = ZERO.plus(1);

  let methodName: string,
    args: Array<string | string[] | number | boolean | PBTimestamp | TContractSwapToken[]>,
    sendOptions: any = {
      onMethod: 'receipt',
    };

  const contract = routerContract;
  const isSwap = !!swapArgs;

  if (isSwap) {
    methodName = methodNameProp || 'swapExactTokensForTokens';
    args = swapArgs;
  } else if (tokenA?.isNative) {
    methodName = 'swapExactTokensForETH';
    args = [
      bigNumberToWeb3Input(amountIn),
      bigNumberToWeb3Input(amountOutMin),
      [getCurrencyAddress(tokenB), getCurrencyAddress(tokenA)],
      account,
      getDeadline(),
      getCID(),
    ];
  } else if (tokenB?.isNative) {
    methodName = 'swapExactETHForTokens';
    sendOptions = { from: account, value: bigNumberToWeb3Input(amountIn) };
    args = [
      bigNumberToWeb3Input(amountOutMin),
      [getCurrencyAddress(tokenB), getCurrencyAddress(tokenA)],
      account,
      getDeadline(),
      getCID(),
    ];
  } else {
    methodName = 'swapExactTokensForTokens';
    args = [
      bigNumberToWeb3Input(amountIn),
      bigNumberToWeb3Input(amountOutMin),
      [getCurrencyAddress(tokenB), getCurrencyAddress(tokenA)],
      account,
      getDeadline(),
      getCID(),
    ];
  }
  try {
    const result = await contract.callSendMethod(methodName, account, args, sendOptions);
    console.log('swap result', result);
    if (result.error) {
      formatSwapError(result.error, {
        amount: divDecimals(amountIn, tokenB?.decimals).dp(8).toFixed(),
        symbol: tokenB?.symbol,
      });
      if (isUserDenied(result.error.message)) return REQ_CODE.UserDenied;
      return REQ_CODE.Fail;
    }
    swapSuccess({ tokenB, tokenA, result, t, isSwap });
    return REQ_CODE.Success;
  } catch (error: any) {
    console.log('onSwap error', error);
    formatSwapError(error, {
      amount: divDecimals(amountIn, tokenB?.decimals).dp(8).toFixed(),
      symbol: tokenB?.symbol,
    });
    return REQ_CODE.Fail;
  }
};
type createPairProps = {
  tokenA?: Currency;
  tokenB?: Currency;
  routerContract: IContract;
  account: string;
  t: TFunction<'translation'>;
};
export const onCreatePair: (param: createPairProps) => Promise<boolean | any> = async ({
  tokenA,
  tokenB,
  routerContract,
  account,
  t,
}) => {
  const symbolA = tokenA?.symbol;
  const symbolB = tokenB?.symbol;

  const contract = routerContract;
  const result = await contract.callSendMethod('CreatePair', account, [`${symbolA}-${symbolB}`]);
  if (result.error) {
    notification.error({
      message: t('CreatePairFailed'),
      description: result.error.message,
    });
    if (isUserDenied(result.error.message)) return REQ_CODE.UserDenied;
    return REQ_CODE.Fail;
  }
  notification.successToExplorer({ message: t('CreatePairSuccess'), txId: getTransactionId(result) }, t);
  return REQ_CODE.Success;
};
