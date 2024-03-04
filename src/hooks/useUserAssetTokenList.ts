import { request } from 'api';
import useChainId from 'hooks/useChainId';
import { useActiveWeb3React } from './web3';
import { useState } from 'react';
import { useInterval } from 'react-use';

export type UserAssetTokenInfo = {
  symbol: string;
  balance: number;
  amount: string;
  priceInUsd: string;
};

export default function useUserAssetTokenList(shouldFetchInterval = true) {
  const { chainId } = useChainId();
  const { account } = useActiveWeb3React();
  const [list, setList] = useState<{
    showList: UserAssetTokenInfo[];
    hiddenList: UserAssetTokenInfo[];
  }>({
    showList: [],
    hiddenList: [],
  });

  const fetchUserAssetTokenList = async () => {
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
    setList({
      showList: resp.data.items,
      hiddenList: [],
    });
    return resp;
  };

  useInterval(() => {
    if (shouldFetchInterval) {
      fetchUserAssetTokenList();
    }
  }, 5000);

  return {
    list,
  };
}
