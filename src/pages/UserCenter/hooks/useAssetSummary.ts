import { useCallback } from 'react';
import { useActiveWeb3React } from 'hooks/web3';
import { baseRequest, IBaseRequest } from 'api';
import { useVerifyMounted } from 'utils/helper';

export const defaultAssetValue = {
  assetUSD: 0,
  assetBTC: 0,
};

export function useAssetSummary<T>(
  requestArg: Pick<IBaseRequest, 'url' | 'params' | 'errMessage'>,
  defaultVal: T,
  timestamp: number,
) {
  const { account, apiChainId } = useActiveWeb3React();

  const fetchAssetSummary = useCallback(async () => {
    if (!account) return;
    const result: any = await baseRequest({
      url: requestArg.url,
      params: {
        user: account,
        chainId: apiChainId,
        ...requestArg.params,
      },
      errMessage: requestArg.errMessage,
    });
    if (result.error) {
      return;
    }
    return Promise.resolve(result);
  }, [account, apiChainId, requestArg.errMessage, requestArg.params, requestArg.url]);

  const assetSummary = useVerifyMounted<T>(defaultVal, fetchAssetSummary, timestamp);

  return assetSummary;
}

export function useAssetModuleSummary<T>(
  requestArg: Pick<IBaseRequest, 'url' | 'params' | 'errMessage'>,
  defaultVal: T,
  timestamp: number,
) {
  const { account, apiChainId } = useActiveWeb3React();
  const fetchAssetSummary = useCallback(async () => {
    if (!account) return;
    const result: any = await baseRequest({
      url: requestArg.url,
      params: {
        address: account,
        chainId: apiChainId,
        ...requestArg.params,
      },
      errMessage: requestArg.errMessage,
    });
    if (result?.error) {
      return;
    }
    return Promise.resolve(result);
  }, [account, apiChainId, requestArg.errMessage, requestArg.params, requestArg.url]);

  const assetSummary = useVerifyMounted<T>(defaultVal, fetchAssetSummary, timestamp);

  return assetSummary;
}
