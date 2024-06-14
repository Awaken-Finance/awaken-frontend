import { useCallback } from 'react';
import { getPairPathApi } from '../utils';
import { TPairRoute, TPairRoutePath } from '../types';
import { useGetPairSyncRecords } from 'graphqlServer';
import { DEFAULT_CHAIN } from 'constants/index';

export const useGetRouteList = () => {
  const getPairSyncRecords = useGetPairSyncRecords();

  return useCallback(
    async ({ startSymbol, endSymbol }: { startSymbol: string; endSymbol: string }) => {
      const routeList: TPairRoute[] = await getPairPathApi({ startSymbol, endSymbol });
      const routePathMap: Record<string, TPairRoutePath[]> = {};

      routeList.forEach((route) => {
        route.path.forEach((item) => {
          if (routePathMap[item.address]) routePathMap[item.address].push(item);
          else routePathMap[item.address] = [item];
        });
      });

      const pairAddressList = Object.keys(routePathMap);
      const pairRecordList = await getPairSyncRecords({
        dto: {
          chainId: DEFAULT_CHAIN,
          pairAddresses: pairAddressList,
        },
      });
      const pairSyncRecords = pairRecordList?.data?.pairSyncRecords || [];
      pairSyncRecords.forEach((item) => {
        const routePaths = routePathMap[item?.pairAddress || ''];
        if (!routePaths) return;
        routePaths.forEach((routePath) => {
          if (routePath.token0.symbol === item?.symbolA) {
            routePath.token0Amount = `${item?.reserveA || 0}`;
            routePath.token1Amount = `${item?.reserveB || 0}`;
          } else {
            routePath.token0Amount = `${item?.reserveB || 0}`;
            routePath.token1Amount = `${item?.reserveA || 0}`;
          }
        });
      });

      return routeList.filter((route) => {
        return !route.path.find((item) => !item.token0Amount || !item.token1Amount);
      });
    },
    [getPairSyncRecords],
  );
};
