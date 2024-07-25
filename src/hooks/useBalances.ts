import { useCallback, useMemo, useState } from 'react';
import BigNumber from 'bignumber.js';
import useInterval from './useInterval';
import { useActiveWeb3React } from './web3';
import { Currency, NativeCurrency } from '@awaken/sdk-core';
import { useAsyncState } from 'hooks';
import { getCurrencyAddress, getLPSymbol } from 'utils/swap';
import { ZERO } from 'constants/misc';
import { useFactoryContract, useTokenContract } from './useContract';
import { getELFChainBalance } from 'contracts';
const bigNAN = new BigNumber('');
// tokens
export const useBalances = (
  // address || symbol
  tokens?: string | Array<string | undefined>,
  delay: null | number = 10000,
  rate?: string,
): [BigNumber[], () => void] => {
  const deArr = useMemo(() => (Array.isArray(tokens) ? tokens.map(() => bigNAN) : [bigNAN]), [tokens]);
  const [balances, setBalances] = useState<BigNumber[]>(deArr);
  const { chainId, account } = useActiveWeb3React();
  const factoryContract = useFactoryContract(rate);
  const tokenContract = useTokenContract();
  const onGetBalance = useCallback(async () => {
    const tokensList = Array.isArray(tokens) ? tokens : [tokens];
    if (!account) return setBalances(tokensList.map(() => bigNAN));
    // elf chain
    const contract = rate ? factoryContract : tokenContract;
    if (!contract) return;
    const promise = tokensList.map((symbol) => {
      if (symbol) return getELFChainBalance(contract, rate ? getLPSymbol(symbol) : symbol, account);
    });
    const bs = await Promise.all(promise);
    setBalances(bs?.map((i: any) => new BigNumber(i ?? '')));
  }, [tokens, account, tokenContract, rate, factoryContract]);

  useInterval(onGetBalance, delay, [account, tokens, chainId, tokenContract, factoryContract]);
  return [balances, onGetBalance];
};

export const useCurrencyBalances = (tokens?: Currency | Array<Currency | undefined>, delay: null | number = 10000) => {
  const [nativeBalances] = useAsyncState<BigNumber[]>();
  const [address, nativeTokens]: [string[], NativeCurrency[]] = useMemo(() => {
    const aList = [],
      tList = [];
    if (Array.isArray(tokens)) {
      tokens.forEach((i) => {
        if (i?.isToken) aList.push(i.address);
        if (i?.isELFChain) aList.push(i.symbol);
        if (i?.isNative) tList.push(i);
      });
    } else {
      if (tokens?.isToken) aList.push(tokens.address);
      if (tokens?.isELFChain) aList.push(tokens.symbol);
      if (tokens?.isNative) tList.push(tokens);
    }
    return [aList, tList];
  }, [tokens]);
  const [balances] = useBalances(address, delay);
  return useMemo(() => {
    const obj: { [k: string]: BigNumber } = {};
    address.forEach((i, k) => {
      obj[i] = balances[k];
    });
    nativeTokens.forEach((i, k) => {
      if (i.symbol) {
        obj[i.symbol] = nativeBalances?.[k] || ZERO;
        obj[getCurrencyAddress(i)] = nativeBalances?.[k] || ZERO;
      }
    });
    return obj;
  }, [address, balances, nativeBalances, nativeTokens]);
};

export type TBalancesV2 = { [symbol: string]: BigNumber } | undefined;
export const useBalancesV2 = (
  // address || symbol
  tokens?: string | Array<string | undefined>,
  delay: null | number = 10000,
  rate?: string,
): [TBalancesV2, () => void] => {
  const deArr: TBalancesV2 | undefined = useMemo(() => {
    if (!tokens) return;
    if (Array.isArray(tokens)) {
      return tokens.reduce((acc: any, symbol) => {
        if (symbol) {
          const _symbol = rate ? getLPSymbol(symbol) : symbol;
          acc[_symbol] = bigNAN;
          return acc;
        }
        return acc;
      }, {});
    }
    return { [tokens]: bigNAN };
  }, [rate, tokens]);
  const [balances, setBalances] = useState<TBalancesV2>(deArr);
  const { chainId, account } = useActiveWeb3React();
  const factoryContract = useFactoryContract(rate);
  const tokenContract = useTokenContract();
  const onGetBalance = useCallback(async () => {
    const tokensList = Array.isArray(tokens) ? tokens : [tokens];

    if (!account) {
      return setBalances(
        tokensList.reduce((acc: any, symbol) => {
          if (symbol) {
            const _symbol = rate ? getLPSymbol(symbol) : symbol;
            acc[_symbol] = bigNAN;
            return acc;
          }
          return acc;
        }, {}),
      );
    }
    // elf chain
    const contract = rate ? factoryContract : tokenContract;
    if (!contract) return;
    const bs: TBalancesV2 = {};
    const promise = tokensList.map(async (symbol) => {
      if (symbol) {
        const _symbol = rate ? getLPSymbol(symbol) : symbol;
        const balance = await getELFChainBalance(contract, _symbol, account);
        bs[_symbol] = ZERO.plus(balance ?? '');
      }
    });
    await Promise.all(promise);

    setBalances(bs);
  }, [tokens, account, tokenContract, rate, factoryContract]);

  useInterval(onGetBalance, delay, [account, tokens, chainId, tokenContract, factoryContract]);
  return [balances, onGetBalance];
};

export const useCurrencyBalancesV2 = (
  tokens?: Currency | Array<Currency | undefined>,
  delay: null | number = 10000,
) => {
  const [address]: [string[], NativeCurrency[]] = useMemo(() => {
    const aList = [],
      tList = [];
    if (Array.isArray(tokens)) {
      tokens.forEach((i) => {
        if (i?.isToken) aList.push(i.address);
        if (i?.isELFChain) aList.push(i.symbol);
        if (i?.isNative) tList.push(i);
      });
    } else {
      if (tokens?.isToken) aList.push(tokens.address);
      if (tokens?.isELFChain) aList.push(tokens.symbol);
      if (tokens?.isNative) tList.push(tokens);
    }
    return [aList, tList];
  }, [tokens]);
  const [bs] = useBalancesV2(address, delay);
  return bs;
};
