import { Currency } from '@awaken/sdk-core';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useUserAddedTokens } from 'contexts/useUser/hooks';
import { IContract } from 'types';

// undefined if invalid or does not exist
// null if loading or null was passed
// otherwise returns the token

export function useViewCallResult(contract: IContract, methodName: string) {
  const [loading, setLoading] = useState<boolean>();
  const [result, setResult] = useState<string>();
  const callData = useCallback(async () => {
    setLoading(true);
    const r = await contract?.callViewMethod(methodName);
    setLoading(false);
    setResult(r);
  }, [contract, methodName]);
  useEffect(() => {
    contract && callData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract?.address, methodName]);
  return useMemo(
    () => ({
      loading,
      result,
    }),
    [loading, result],
  );
}

// Check if currency is included in custom list from user storage
export function useIsUserAddedToken(currency: Currency | undefined | null): boolean {
  const userAddedTokens = useUserAddedTokens();
  if (!currency) {
    return false;
  }
  return !!userAddedTokens.find((token) => currency.equals(token));
}
