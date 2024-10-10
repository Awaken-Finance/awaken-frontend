import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import { MenuItem } from 'components/Header/router';
import { useGetActivityList } from 'graphqlServer';
import { TActivityBase } from 'graphqlServer/queries/activity/common';
import { CmsStatusEnum } from 'graphqlServer/types/cms';
import { ActivityStatusEnum, useActivityStatus } from 'pages/Activity/hooks/common';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getValidAddress } from 'utils/wallet';

export const useActivityEntry = () => {
  const getActivityList = useGetActivityList();
  const [list, setList] = useState<TActivityBase[]>([]);
  const { walletInfo } = useConnectWallet();

  const init = useCallback(async () => {
    try {
      const list = await getActivityList({
        filter: {
          _and: {
            unpublishTime: {
              _gt: '$NOW',
            },
            isMain: {
              _eq: true,
            },
          },
        },
      });
      setList(list.data.activityList);
    } catch (error) {
      console.log('useActivityEntry init error', error);
    }
  }, [getActivityList]);

  useEffect(() => {
    init();
  }, [init]);

  const activity = useMemo(() => {
    const address = walletInfo?.address;
    const _list = list.filter((item) => {
      if (item.status !== CmsStatusEnum.published) return false;

      if (item.isDev) {
        if (item.whitelist && address) {
          if (item.whitelist.map((item) => getValidAddress(item)).includes(address)) return true;
        }
        return false;
      }

      return true;
    });
    return _list[0] as TActivityBase | undefined;
  }, [list, walletInfo?.address]);

  const status = useActivityStatus({
    startTime: activity?.publishTime,
    endTime: activity?.unpublishTime,
  });

  return useMemo<MenuItem | undefined>(() => {
    if (!activity) return undefined;
    if (status === ActivityStatusEnum.Completion) return undefined;
    if (status === ActivityStatusEnum.Preparation) {
      const address = walletInfo?.address;
      if (!activity.whitelist || !address) return undefined;
      if (!activity.whitelist.map((item) => getValidAddress(item)).includes(address)) return undefined;
    }

    return {
      key: 'activity',
      title: '🔥 Event',
      path: `/activity/${activity.pageId}`,
    };
  }, [activity, status, walletInfo?.address]);
};
