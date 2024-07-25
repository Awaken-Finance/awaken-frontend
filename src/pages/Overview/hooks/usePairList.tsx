import { useRequest } from 'ahooks';
import { getPairList, GetPairListParams, getPairListByIds } from '../apis/getPairList';
import { useActiveWeb3React } from 'hooks/web3';
import { useFavs } from './useFavs';
import { IsCAWallet } from 'utils/wallet';
import { useCallback, useMemo, useRef } from 'react';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';

export default function usePairList() {
  const { apiChainId } = useActiveWeb3React();
  const { walletType, walletInfo } = useConnectWallet();
  const [{ favlist }] = useFavs();

  const getLocalFavs = useRef<boolean>(false);

  const isCAWallet = useMemo(() => IsCAWallet(walletType), [walletType]);

  const {
    data,
    loading,
    runAsync: getData,
  } = useRequest(
    async (params: GetPairListParams) => {
      if (isCAWallet) {
        return getPairList(params);
      }

      const data = getLocalFavs.current ? await getPairListByIds(params) : await getPairList(params);

      data?.items.forEach((item) => {
        item.isFav = (favlist as string[]).includes(item.id);
      });

      return data;
    },
    {
      manual: true,
      debounceLeading: true,
      debounceWait: 200,
    },
  );

  const getList = useCallback(
    (params: GetPairListParams) => {
      if (params.tradePairFeature === 1 && !isCAWallet) {
        getLocalFavs.current = true;
        params.tokenSymbol = '';
        params.ids = favlist ?? [];
      } else {
        getLocalFavs.current = false;
      }

      params.chainId = apiChainId;
      params.address = walletInfo?.address;

      return getData(params);
    },
    [apiChainId, favlist, getData, isCAWallet, walletInfo?.address],
  );

  return useMemo(() => {
    return [
      {
        list: data?.items,
        total: data?.totalCount,
        loading,
      },
      { getList },
    ];
  }, [data?.items, data?.totalCount, loading, getList]);
}
