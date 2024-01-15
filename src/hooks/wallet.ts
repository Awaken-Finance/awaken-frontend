import BigNumber from 'bignumber.js';
import { useMemo } from 'react';
import { useBalances } from './useBalances';
import { useAllTokenList } from './tokenList';

export function useAllTokenBalances(): {
  [tokenAddress: string]: BigNumber;
} {
  const allTokens = useAllTokenList();
  const allTokensArray = useMemo(() => Object.values(allTokens ?? {}), [allTokens]);
  const validatedTokenAddresses = useMemo(() => allTokensArray.map((vt) => vt.address), [allTokensArray]);
  const [balances] = useBalances(validatedTokenAddresses, null);
  return useMemo(() => {
    const obj: { [tokenAddress: string]: BigNumber } = {};
    validatedTokenAddresses.forEach((i, k) => {
      obj[i] = balances[k];
    });
    return obj;
  }, [validatedTokenAddresses, balances]);
}
