import { ELFChainToken } from '@awaken/sdk-core';
import { useUserAddedTokens } from 'contexts/useUser/hooks';
import DEFAULT_TOKEN_LIST_AELF from '@awaken/default-token-list';
import DEFAULT_TOKEN_LIST_TDVV from '@awaken/default-token-list/tdvv';
import DEFAULT_TOKEN_LIST_TDVW from '@awaken/default-token-list/tdvw';
import useChainId from 'hooks/useChainId';
import { useMemo } from 'react';
import useSWR from 'swr';
import { Token } from 'types';

const API_ENV = process.env.REACT_APP_API_ENV;
const AWAKEN_LIST_MAP: { [key: string]: string } = {
  local:
    'https://raw.githubusercontent.com/Awaken-Finance/default-token-list/main/build/awaken-default.tokenlist.tdvw.json',
  test: 'https://raw.githubusercontent.com/Awaken-Finance/default-token-list/main/build/awaken-default.tokenlist.tdvw.json',
  preview:
    'https://raw.githubusercontent.com/Awaken-Finance/default-token-list/main/build/awaken-default.tokenlist.tdvw.json',
  main: 'https://raw.githubusercontent.com/Awaken-Finance/default-token-list/main/build/awaken-default.tokenlist.tdvv.json',
};

const AWAKEN_TOKEN_LIST_URL = AWAKEN_LIST_MAP[API_ENV || 'main'];

function useRemoateTokenList() {
  return useSWR(AWAKEN_TOKEN_LIST_URL, (url: string) => fetch(url).then((res) => res.json()));
}

export function useAllTokenList() {
  const { chainId } = useChainId();
  const userAddedTokens = useUserAddedTokens();
  const defaultTokenList = useMemo(() => {
    switch (chainId) {
      case 'AELF':
        return DEFAULT_TOKEN_LIST_AELF;
      case 'tDVV':
        return DEFAULT_TOKEN_LIST_TDVV;
      case 'tDVW':
        return DEFAULT_TOKEN_LIST_TDVW;
      default:
        throw new Error('Invalid chainId: ' + chainId);
    }
  }, [chainId]);

  const { data: remoteTokenList } = useRemoateTokenList();

  const combinedTokenList = useMemo(() => {
    if (!remoteTokenList || !remoteTokenList.tokens || remoteTokenList.tokens.length === 0) {
      return defaultTokenList;
    }
    return remoteTokenList;
  }, [defaultTokenList, remoteTokenList]);

  const tokenList = useMemo(() => {
    const tokens: Token[] = [];
    combinedTokenList.tokens.forEach((token: Token) => {
      tokens.push(new ELFChainToken(chainId, token.address, token.decimals, token.symbol, token.name));
    });
    userAddedTokens.forEach((token) => {
      if (tokens.find((t) => t.symbol === token.symbol)) {
        return;
      }
      tokens.push(token);
    });
    tokens.sort((a, b) => a.symbol.localeCompare(b.symbol));
    return tokens;
  }, [chainId, combinedTokenList.tokens, userAddedTokens]);

  return tokenList;
}
