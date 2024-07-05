import { request } from 'api';
import useChainId from 'hooks/useChainId';
import { useActiveWeb3React } from './web3';
import { useCallback, useEffect, useState } from 'react';
import { useInterval } from 'react-use';
import { RecentTransaction } from 'pages/UserCenter/type';
import { getTransactionList } from 'pages/UserCenter/apis/recentTransaction';
import { getUserCombinedAssetsApi } from 'api/utils/userCenter';
import { TUserCombinedAssets } from 'types/userCenter';
import { getLiquidityPositionApi } from 'api/utils/portfolio';
import { TTLiquidityPositionResult } from 'types/portfolio';

export type UserAssetTokenInfo = {
  symbol: string;
  balance: number;
  amount: string;
  priceInUsd: string;
};

const ASSET_INTERVAL = 60 * 1000;

export function useUserAssetTokenList(shouldFetchInterval = false) {
  const { chainId } = useChainId();
  const { account } = useActiveWeb3React();
  const [list, setList] = useState<{
    showList: UserAssetTokenInfo[];
    hiddenList: UserAssetTokenInfo[];
  }>({
    showList: [],
    hiddenList: [],
  });

  const fetchUserAssetTokenList = useCallback(async () => {
    if (!account || !chainId) return;
    const resp: any = await request.userCenter.GET_USER_ASSET_TOKEN_LIST({
      errMessage: 'Failed to get token list.',
      params: {
        chainId,
        address: account,
      },
    });
    if (!resp || resp.error || !resp.data) {
      return;
    }
    setList(resp.data);
    return resp;
  }, [account, chainId]);

  useInterval(() => {
    if (shouldFetchInterval) {
      fetchUserAssetTokenList();
    }
  }, ASSET_INTERVAL);

  useEffect(() => {
    if (shouldFetchInterval) fetchUserAssetTokenList();
  }, [fetchUserAssetTokenList, shouldFetchInterval]);

  useEffect(() => {
    setList({
      showList: [],
      hiddenList: [],
    });
    fetchUserAssetTokenList();
  }, [fetchUserAssetTokenList]);

  return {
    list,
  };
}

export function useUserPositions(shouldFetchInterval = false) {
  const { chainId } = useChainId();
  const { account } = useActiveWeb3React();
  const [userPositions, setUserPositions] = useState<TTLiquidityPositionResult>();

  const fetchList = useCallback(async () => {
    if (!account || !chainId) return;
    try {
      const data = await getLiquidityPositionApi({
        chainId,
        address: account,
        skipCount: 0,
        maxResultCount: 5,
      });
      setUserPositions(data);
      return data;
    } catch (error) {
      console.log('useUserPositions error', error);
    }
  }, [account, chainId]);

  useInterval(() => {
    if (shouldFetchInterval) {
      fetchList();
    }
  }, ASSET_INTERVAL);

  useEffect(() => {
    if (shouldFetchInterval) fetchList();
  }, [fetchList, shouldFetchInterval]);

  useEffect(() => {
    setUserPositions(undefined);
    fetchList();
  }, [fetchList]);

  return {
    userPositions,
  };
}

export function useUserTransactions(shouldFetchInterval = false) {
  const { chainId } = useChainId();
  const { account } = useActiveWeb3React();
  const [list, setList] = useState<RecentTransaction[]>();

  const fetchList = useCallback(async () => {
    if (!account || !chainId) return;
    try {
      const data = await getTransactionList({
        chainId,
        address: account,
        skipCount: 0,
        maxResultCount: 5,
      });
      setList(data.items);
      return data;
    } catch (error) {
      console.log('useUserTransactions error', error);
    }
  }, [account, chainId]);

  useInterval(() => {
    if (shouldFetchInterval) {
      fetchList();
    }
  }, ASSET_INTERVAL);

  useEffect(() => {
    if (shouldFetchInterval) fetchList();
  }, [fetchList, shouldFetchInterval]);

  useEffect(() => {
    setList(undefined);
    fetchList();
  }, [fetchList]);

  return {
    list,
  };
}

export function useUserCombinedAssets(shouldFetchInterval = false) {
  const { chainId } = useChainId();
  const { account } = useActiveWeb3React();
  const [data, setData] = useState<TUserCombinedAssets>();

  const fetchList = useCallback(async () => {
    if (!account || !chainId) return;
    try {
      const data = await getUserCombinedAssetsApi({
        chainId,
        address: account,
      });
      setData(data);
      return data;
    } catch (error) {
      console.log('useUserCombinedAssets error', error);
    }
  }, [account, chainId]);

  useInterval(() => {
    if (shouldFetchInterval) {
      fetchList();
    }
  }, ASSET_INTERVAL);

  useEffect(() => {
    if (shouldFetchInterval) fetchList();
  }, [fetchList, shouldFetchInterval]);

  useEffect(() => {
    setData(undefined);
    fetchList();
  }, [fetchList]);

  return {
    data,
  };
}
