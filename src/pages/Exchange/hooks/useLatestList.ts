import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSwapContext } from './useSwap';
import { useActiveWeb3React } from 'hooks/web3';
import { ReceiveUserTradeRecordsInterface, TradeItem } from 'socket/socketType';
import lodash, { isArray } from 'lodash';
import { getIsReversed } from 'utils/pair';
import { ONE } from 'constants/misc';

export function useMarketTradeList(tradePairId?: string, maxResultCount?: number) {
  const [list, setList] = useState<TradeItem[]>();

  const [{ socket }] = useSwapContext();
  const { apiChainId } = useActiveWeb3React();

  const receiveRemoveTradeRecord = useCallback((res: { data: { transactionHash: string }[] }) => {
    setList((v) => {
      if (!v) return v;
      return v.filter(
        ({ transactionHash }) => !res?.data.find((delItem) => delItem.transactionHash === transactionHash),
      );
    });
  }, []);

  const receiveTradeRecords = useCallback(
    (rec: ReceiveUserTradeRecordsInterface) => {
      if (rec.chainId !== apiChainId || rec.tradePairId !== tradePairId || !isArray(rec.data)) {
        return;
      }
      setList(rec.data);
    },
    [apiChainId, tradePairId],
  );

  const receiveTradeRecord = useCallback(
    (rec: TradeItem) => {
      if (rec.chainId !== apiChainId || rec.tradePair.id !== tradePairId) {
        return;
      }
      // max is 200
      setList((v) => {
        if (!v) v = [];
        if (v.length >= 200) {
          v.pop();
          return [rec, ...v];
        }
        return [rec, ...v];
      });
    },
    [apiChainId, tradePairId],
  );

  useEffect(() => {
    socket?.on('ReceiveRemovedTradeRecord', receiveRemoveTradeRecord);
    socket?.RequestRemovedTradeRecord(apiChainId, tradePairId);
    return () => {
      socket?.off('ReceiveRemovedTradeRecord', receiveRemoveTradeRecord);
      socket?.UnsubscribeRemovedTradeRecord(apiChainId, tradePairId);
    };
  }, [apiChainId, receiveRemoveTradeRecord, socket, tradePairId]);

  useEffect(() => {
    setList(undefined);

    socket?.on('ReceiveTradeRecords', receiveTradeRecords);
    socket?.on('ReceiveTradeRecord', receiveTradeRecord);
    socket?.RequestTradeRecord(apiChainId, tradePairId, maxResultCount);
    return () => {
      socket?.off('ReceiveTradeRecords', receiveTradeRecords);
      socket?.off('ReceiveTradeRecord', receiveTradeRecord);
      socket?.UnsubscribeTradeRecord(apiChainId, tradePairId);
    };
  }, [apiChainId, maxResultCount, receiveTradeRecord, receiveTradeRecords, socket, tradePairId]);

  return useMemo(() => {
    if (!list) return list;
    return lodash.cloneDeep(list).map((item) => {
      const isReversed = getIsReversed(item.tradePair.token0, item.tradePair.token1);
      if (!isReversed) {
        return item;
      }

      return {
        ...item,
        price: ONE.div(item.price).toNumber(),
        token0Amount: item.token1Amount,
        token1Amount: item.token0Amount,
        tradePair: {
          token0: item.tradePair.token1,
          token1: item.tradePair.token0,
        },
        side: item.side === 0 ? 1 : 0,
      };
    });
  }, [list]);
}

export function useUserTradList(tradePairId?: string, address?: string, maxResultCount?: number) {
  const [list, setList] = useState<TradeItem[]>();

  const [{ socket }] = useSwapContext();
  const { apiChainId } = useActiveWeb3React();

  const receiveRemovedUserTradeRecord = useCallback((res: { data: { transactionHash: string }[] }) => {
    setList((v) => {
      if (!v) return v;
      return v.filter(
        ({ transactionHash }) => !res?.data.find((delItem) => delItem.transactionHash === transactionHash),
      );
    });
  }, []);

  const receiveUserTradeRecords = useCallback(
    (rec: ReceiveUserTradeRecordsInterface) => {
      if (rec.chainId !== apiChainId || rec.tradePairId !== tradePairId || !isArray(rec.data)) {
        return;
      }

      setList(rec.data);
    },
    [apiChainId, tradePairId],
  );

  useEffect(() => {
    socket?.on('ReceiveRemovedUserTradeRecord', receiveRemovedUserTradeRecord);
    socket?.RequestRemovedUserTradeRecord(apiChainId, tradePairId, address);

    return () => {
      socket?.off('ReceiveRemovedUserTradeRecord', receiveRemovedUserTradeRecord);
      socket?.UnsubscribeRemovedUserTradeRecord(apiChainId, tradePairId, address);
    };
  }, [address, apiChainId, receiveRemovedUserTradeRecord, socket, tradePairId]);

  const receiveUserTradeRecord = useCallback(
    (rec: TradeItem) => {
      if (rec.chainId !== apiChainId || rec.tradePair.id !== tradePairId) {
        return;
      }

      // max is 200
      setList((v) => {
        if (!v) v = [];
        if (v.length >= 200) {
          v.pop();
          return [rec, ...v];
        }
        return [rec, ...v];
      });
    },
    [apiChainId, tradePairId],
  );

  useEffect(() => {
    setList(undefined);
    socket?.on('ReceiveUserTradeRecords', receiveUserTradeRecords);
    socket?.on('ReceiveUserTradeRecord', receiveUserTradeRecord);
    socket?.RequestUserTradeRecord(apiChainId, tradePairId, address, maxResultCount);
    return () => {
      socket?.off('ReceiveUserTradeRecords', receiveUserTradeRecords);
      socket?.off('ReceiveUserTradeRecord', receiveUserTradeRecord);
      socket?.UnsubscribeUserTradeRecord(apiChainId, tradePairId, address);
    };
  }, [apiChainId, socket, tradePairId, address, maxResultCount, receiveUserTradeRecords, receiveUserTradeRecord]);

  return useMemo(() => {
    if (!list) return list;
    return lodash.cloneDeep(list).map((item) => {
      const isReversed = getIsReversed(item.tradePair.token0, item.tradePair.token1);
      if (!isReversed) {
        return item;
      }

      return {
        ...item,
        price: ONE.div(item.price).toNumber(),
        token0Amount: item.token1Amount,
        token1Amount: item.token0Amount,
        tradePair: {
          token0: item.tradePair.token1,
          token1: item.tradePair.token0,
        },
        side: item.side === 0 ? 1 : 0,
      };
    });
  }, [list]);
}
