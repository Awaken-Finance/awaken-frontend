import BigNumber from 'bignumber.js';
import { useMemo } from 'react';
import { useBalances } from './useBalances';
import { useAllTokenList } from './tokenList';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import { useIsConnected } from './useLogin';
import { TAelfAccounts } from '@etransfer/ui-react';
import { DEFAULT_CHAIN } from 'constants/index';

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

export function useGetAccount() {
  const { walletInfo } = useConnectWallet();
  const isLogin = useIsConnected();

  return useMemo(() => {
    if (!isLogin) return undefined;

    const accounts: TAelfAccounts = {
      AELF: 'ELF_' + walletInfo?.address + '_' + 'AELF',
      [DEFAULT_CHAIN]: 'ELF_' + walletInfo?.address + '_' + DEFAULT_CHAIN,
    };

    return accounts;
  }, [isLogin, walletInfo]);
}
