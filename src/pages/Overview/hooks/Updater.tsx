import { useCallback, useEffect } from 'react';
import Socket from 'socket';
import { useOVContext } from './useOverview';
import { useActiveWeb3React } from 'hooks/web3';
import { useHistory } from 'react-router';
import { useUpdateEffect } from 'react-use';

export default function Updater() {
  const [{ socket }, { setSocket }] = useOVContext();
  const useSocket = Socket();
  const history = useHistory();
  const { apiChainId, chainId } = useActiveWeb3React();

  const connectSocket = useCallback(() => {
    useSocket && setSocket(useSocket);
  }, [setSocket, useSocket]);

  useEffect(() => {
    socket?.RequestTradePair(apiChainId);
    return () => {
      socket?.UnsubscribeTradePair(apiChainId);
    };
  }, [apiChainId, socket]);

  useEffect(() => {
    connectSocket();
    return () => {
      socket?.destroy();
    };
  }, [connectSocket, socket]);

  useUpdateEffect(() => {
    history.push('/');
  }, [chainId, history]);

  return null;
}
