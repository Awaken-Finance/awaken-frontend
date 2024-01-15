import { ELFChainToken, ERCToken } from '@awaken/sdk-core';
import { useActiveWeb3React } from 'hooks/web3';
import { useCallback, useMemo } from 'react';
import { useUser } from '.';
import { SerializedToken } from './actions';
import { Token } from 'types';
import { isELFChain } from 'utils/aelfUtils';
function deserializeToken(serializedToken: SerializedToken): Token {
  const chainId = isELFChain(serializedToken.chainId);
  if (chainId) {
    return new ELFChainToken(
      chainId,
      serializedToken.address,
      serializedToken.decimals,
      serializedToken.symbol,
      serializedToken.name,
    );
  }
  return new ERCToken(
    serializedToken.chainId,
    serializedToken.address,
    serializedToken.decimals,
    serializedToken.symbol,
    serializedToken.name,
  );
}
export function useUserAddedTokens(): Token[] {
  const { chainId } = useActiveWeb3React();
  const [{ tokens }] = useUser();
  return useMemo(() => {
    if (!chainId) return [];
    return Object.values(tokens?.[chainId] ?? {}).map(deserializeToken);
  }, [tokens, chainId]);
}
export function useAddUserToken() {
  const [, { addToken }] = useUser();
  return useCallback(addToken, [addToken]);
}
export function useRemoveUserAddedToken() {
  const [, { removeToken }] = useUser();
  return useCallback(removeToken, [removeToken]);
}
export function useClearUserChainIdTokens() {
  const [, { clearChainIdTokens }] = useUser();
  return useCallback(clearChainIdTokens, [clearChainIdTokens]);
}
