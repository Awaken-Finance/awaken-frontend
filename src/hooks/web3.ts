import { useMemo } from 'react';
import useChainId from '../hooks/useChainId';
import { useWebLogin } from 'aelf-web-login';

export function useActiveWeb3React() {
  // const [{ userChainId }] = useChain();
  const { chainId, apiChainId } = useChainId();
  const { wallet } = useWebLogin();
  const tmpContext = useMemo(() => {
    if (typeof chainId === 'string') {
      return {
        chainId,
        account: wallet.address,
        library: undefined,
        apiChainId,
        error: null,
        active: false,
        aelfInstance: undefined,
      };
    }
    throw new Error(`Unsupported chainId: ${chainId}`);
  }, [chainId, wallet.address, apiChainId]);
  return tmpContext;
}
