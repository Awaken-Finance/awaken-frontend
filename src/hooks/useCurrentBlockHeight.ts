import { message } from 'antd';
import { request } from 'api';
import { useCallback, useState } from 'react';
import useInterval from 'hooks/useInterval';
import { useActiveWeb3React } from './web3';
import { getBlockHeight as getAElfBlockHeight } from 'utils/aelfUtils';
import i18n from 'i18next';

async function getBlockHeight(apiChainId: string) {
  const blockHeight: any = await request.GET_CURRENCY_BLOCK_HEIGHT({
    // TODO mock
    query: apiChainId,
  });
  if (!blockHeight || blockHeight?.error) {
    throw Error('Failed to get the latest block height');
    return;
  }
  return blockHeight?.latestBlockHeight;
}

export function useCurrentBlockHeight(intervalTime = 15000) {
  const { apiChainId, chainId } = useActiveWeb3React();
  const [height, setHeight] = useState<number>();

  // const intervalTimer = useMemo(() => {
  //   if (intervalTime) return intervalTime;
  //   const blockPerDay = ChainConstants.constants.BLOCK_PER_DAY;
  //   return (24 * 60 * 60 * 1000) / blockPerDay;
  // }, [intervalTime]);

  const fetchBlockHeight = useCallback(async () => {
    let blockHeight;
    try {
      if (typeof chainId === 'string') {
        blockHeight = await getAElfBlockHeight();
      } else {
        blockHeight = apiChainId && (await getBlockHeight(apiChainId));
      }
    } catch (e) {
      message.error(i18n.t('Failed to get the latest block height'));
    }
    setHeight(isNaN(blockHeight) ? '-' : blockHeight);
  }, [apiChainId, chainId]);

  useInterval(fetchBlockHeight, intervalTime, [fetchBlockHeight]);
  return height;
}
