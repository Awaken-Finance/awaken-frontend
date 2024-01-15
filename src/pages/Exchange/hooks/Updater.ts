import { useCallback, useEffect } from 'react';
import Socket from 'socket';
import { useSwapContext } from './useSwap';
import { useActiveWeb3React } from 'hooks/web3';
import { useHistory, useParams } from 'react-router';
import { useUpdateEffect } from 'react-use';
import { useWebLogin } from 'aelf-web-login';
import { useUser } from 'contexts/useUser';
import { getPairList } from 'pages/Overview/apis/getPairList';
import BigNumber from 'bignumber.js';
import { PoolItem } from 'types';

export default function Updater() {
  const [{ socket, pairInfo }, { setSocket, pairInfoUpdater }] = useSwapContext();
  const useSocket = Socket();
  const params = useParams<{ pair?: string }>();
  const history = useHistory();
  const { apiChainId, chainId } = useActiveWeb3React();
  const { wallet } = useWebLogin();

  const [{ favChangeItem }, { isFavById }] = useUser();

  const connectSocket = useCallback(() => {
    useSocket && setSocket(useSocket);
  }, [setSocket, useSocket]);

  const updatePairInfo = useCallback(
    (data: PoolItem) => {
      if (data.id !== pairInfo?.id) {
        return;
      }

      const newPairInfo = {
        ...data,
        isFav: pairInfo.isFav,
        favId: pairInfo.favId,
      };

      pairInfoUpdater(newPairInfo);
    },
    [pairInfo?.favId, pairInfo?.id, pairInfo?.isFav, pairInfoUpdater],
  );

  const getPairInfo = useCallback(
    async (token0Symbol?: string, token1Symbol?: string, feeRate?: number | string) => {
      const fee = new BigNumber(feeRate ?? '').div(100).toFormat();
      const pairList = await getPairList({
        token0Symbol,
        token1Symbol,
        feeRate: fee,
        chainId: apiChainId,
        address: wallet?.address,
      });

      if (!pairList || !pairList?.items?.length) {
        history.replace('/trading');
        return null;
      }

      const pairInfo = pairList.items[0];
      if (isFavById(wallet?.address, pairInfo?.id)) {
        pairInfo.isFav = true;
      }

      pairInfoUpdater(pairInfo);
    },
    [wallet.address, apiChainId, isFavById, pairInfoUpdater, history],
  );

  useUpdateEffect(() => {
    socket?.RequestTradePairDetail(pairInfo?.id);

    socket?.on('ReceiveTradePairDetail', updatePairInfo);

    return () => {
      socket?.UnsubscribeTradePairDetail(pairInfo?.id);
      socket?.off('ReceiveTradePairDetail', updatePairInfo);
    };
  }, [socket, updatePairInfo]);

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
    const { id, isFav, favId } = favChangeItem;

    if (!pairInfo || pairInfo.id !== id) {
      return;
    }

    pairInfo.isFav = !!isFav;
    pairInfo.favId = favId;

    pairInfoUpdater(pairInfo);
  }, [favChangeItem]);

  useUpdateEffect(() => {
    history.push('/trading');
  }, [chainId, history]);

  useEffect(() => {
    const [token0Symbol, token1Symbol, feeRate] = params.pair?.split('_') || ['ELF', 'USDT', '0.05'];
    getPairInfo(token0Symbol, token1Symbol, feeRate);
  }, [wallet.address, params?.pair, getPairInfo]);

  return null;
}
