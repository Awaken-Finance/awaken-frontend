import { useMemo } from 'react';
import useChainId from '../hooks/useChainId';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';

export function useActiveWeb3React() {
  const { chainId, apiChainId } = useChainId();
  const { walletInfo } = useConnectWallet();
  const tmpContext = useMemo(() => {
    if (typeof chainId === 'string') {
      return {
        chainId,
        account: walletInfo?.address || '',
        library: undefined,
        apiChainId,
        error: null,
        active: false,
        aelfInstance: undefined,
      };
    }
    throw new Error(`Unsupported chainId: ${chainId}`);
  }, [chainId, walletInfo?.address, apiChainId]);
  return tmpContext;
}
