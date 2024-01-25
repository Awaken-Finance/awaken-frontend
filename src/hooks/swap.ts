import { useCallback, useEffect, useMemo, useState } from 'react';
import { divDecimals, timesDecimals } from 'utils/calculate';
import { getAmount, getCurrencyAddress, getLiquidity, getLiquidityAmount, getLPDecimals, quote } from 'utils/swap';
import { Outputs, RemoveOutputs, Reserves, Tokens } from 'types/swap';
import BigNumber from 'bignumber.js';
import { isEqCurrency } from 'utils';
import { useActiveWeb3React } from './web3';
import { useDeepCompareEffect } from 'react-use';
import { ZERO } from 'constants/misc';
import { Currency } from '@awaken/sdk-core';

export function useAddLiquidityInputs(
  reserves?: Reserves,
  tokens?: Tokens,
): [Outputs | undefined, (inputAddress: string, input: string) => void, () => void] {
  const [inputs, setInputs] = useState<Outputs | undefined>({});
  const [lastInput, setLastInput] = useState<string>();

  const onChange = useCallback(
    (inputAddress, input) => {
      if (!input) {
        return setInputs(reserves ? undefined : { ...inputs, [inputAddress]: undefined });
      }
      setLastInput(inputAddress);

      if (!reserves || Object.values(reserves).filter((i) => !ZERO.gte(i)).length < 1)
        return setInputs({ ...inputs, [inputAddress]: input });

      const outputToken = Object.values(tokens || {}).find((i) => getCurrencyAddress(i) !== inputAddress);
      const outputAddress = getCurrencyAddress(outputToken);
      const token = tokens?.[inputAddress];
      const reserveInput = reserves?.[inputAddress];
      const reserveOutput = reserves?.[outputAddress];
      const amountInput = timesDecimals(input, token?.decimals);
      const amountOut = quote(amountInput, reserveInput, reserveOutput);
      const showAmountOut = divDecimals(amountOut, outputToken?.decimals);
      setInputs({
        [inputAddress]: input,
        [outputAddress]: showAmountOut.dp(outputToken?.decimals ?? 8).toString(),
      });
    },
    [inputs, reserves, tokens],
  );
  const clearInputs = useCallback(() => {
    setInputs(undefined);
  }, []);
  useEffect(() => {
    lastInput && onChange(lastInput, inputs?.[lastInput]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reserves]);
  return [inputs, onChange, clearInputs];
}

export function useRemoveLiquidityInputs(
  balance: BigNumber,
  reserves?: Reserves,
  totalSupply?: string,
  tokens?: Tokens,
): [RemoveOutputs | undefined, (inputAddress: string, input?: string | number) => void, () => void] {
  const [inputs, setInputs] = useState<RemoveOutputs | undefined>({});
  const [lastInput, setLastInput] = useState<string>();
  const onChange = useCallback(
    (inputAddress, input) => {
      if (!input || !totalSupply) return setInputs(undefined);
      const lpDecimals = getLPDecimals();
      setLastInput(inputAddress);
      if (!reserves) return setInputs({ ...inputs, [inputAddress]: input });

      if (inputAddress === 'side') {
        const tokenList = Object.values(tokens || {});
        const bigIn = new BigNumber(balance).times(input).div(100);
        const tokenA = tokenList[0],
          tokenB = tokenList[1];
        if (!tokenA || !tokenB) return;
        const addressA = getCurrencyAddress(tokenA);
        const addressB = getCurrencyAddress(tokenB);
        const reserveA = reserves[addressA];
        const reserveB = reserves[addressB];

        const amountA = divDecimals(getLiquidityAmount(bigIn, reserveA, totalSupply), tokenA.decimals).toFixed();
        const amountB = divDecimals(getLiquidityAmount(bigIn, reserveB, totalSupply), tokenB.decimals).toFixed();
        setInputs({
          [addressA]: amountA,
          [addressB]: amountB,
          lp: divDecimals(bigIn, lpDecimals).toFixed(),
          side: input,
        });
      } else if (inputAddress === 'lp') {
        const tokenList = Object.values(tokens || {});
        const bigIn = timesDecimals(input, lpDecimals);
        const tokenA = tokenList[0],
          tokenB = tokenList[1];
        if (!tokenA || !tokenB) return;
        const addressA = getCurrencyAddress(tokenA);
        const addressB = getCurrencyAddress(tokenB);
        const reserveA = reserves[addressA];
        const reserveB = reserves[addressB];

        const showLp = divDecimals(bigIn, lpDecimals);
        const side =
          balance.lte(0) || balance.isNaN() ? '0' : showLp.div(divDecimals(balance, lpDecimals)).times(100).toFixed(0);

        const amountA = divDecimals(getLiquidityAmount(bigIn, reserveA, totalSupply), tokenA.decimals).toFixed();
        const amountB = divDecimals(getLiquidityAmount(bigIn, reserveB, totalSupply), tokenB.decimals).toFixed();
        setInputs({
          [addressA]: amountA,
          [addressB]: amountB,
          lp: input,
          side,
        });
      } else {
        const outputToken = Object.values(tokens || {}).find((i) => getCurrencyAddress(i) !== inputAddress);
        const outputAddress = getCurrencyAddress(outputToken);

        const token = tokens?.[inputAddress];
        const reserveInput = reserves?.[inputAddress];
        const reserveOutput = reserves?.[outputAddress];
        const amountInput = timesDecimals(input, token?.decimals);
        const lp = getLiquidity(amountInput, reserveInput, totalSupply).toFixed();
        const amountOut = getAmount(amountInput, reserveInput, reserveOutput).toFixed();
        const showLp = divDecimals(lp, lpDecimals);
        const side = showLp.div(divDecimals(balance, lpDecimals)).times(100).toFixed(0);
        setInputs({
          [inputAddress]: input,
          [outputAddress]: divDecimals(amountOut, outputToken?.decimals).toFixed(),
          lp: showLp.toFixed(),
          side,
        });
      }
    },
    [balance, inputs, reserves, tokens, totalSupply],
  );
  const clearInputs = useCallback(() => {
    setInputs(undefined);
  }, []);
  useEffect(() => {
    lastInput && onChange(lastInput, inputs?.[lastInput]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reserves]);
  return [inputs, onChange, clearInputs];
}
export const useTokens = (leftToken?: Currency, rightToken?: Currency) => {
  return useMemo(() => {
    return {
      [getCurrencyAddress(leftToken)]: leftToken,
      [getCurrencyAddress(rightToken)]: rightToken,
    } as any;
  }, [leftToken, rightToken]);
};

export function useSelectPair(tokenA?: Currency, tokenB?: Currency) {
  const { chainId } = useActiveWeb3React();

  const [leftToken, setLeft] = useState<Currency | undefined>();
  const [rightToken, setRight] = useState<Currency | undefined>();

  const setLeftToken = useCallback(
    (currency?: Currency) => {
      if (isEqCurrency(currency, rightToken)) setRight(undefined);
      setLeft(currency);
    },
    [rightToken],
  );
  const setRightToken = useCallback(
    (currency?: Currency) => {
      if (isEqCurrency(currency, leftToken)) setLeft(undefined);
      setRight(currency);
    },
    [leftToken],
  );
  useEffect(() => {
    !rightToken && tokenB && !isEqCurrency(tokenB, leftToken) && setRight(tokenB);
  }, [leftToken, rightToken, tokenB]);

  useEffect(() => {
    !leftToken && tokenA && !isEqCurrency(tokenA, rightToken) && setLeft(tokenA);
  }, [leftToken, rightToken, tokenA]);
  useDeepCompareEffect(() => {
    // setLeft(tokenA || ChainConstants.constants.COMMON_BASES[0]);
    // setRight(tokenB || ChainConstants.constants.COMMON_BASES[1]);
    setLeft(tokenA);
    setRight(tokenB);
  }, [chainId, tokenA || {}, tokenB || {}]);
  return {
    leftToken,
    rightToken,
    setLeftToken,
    setRightToken,
  };
}
