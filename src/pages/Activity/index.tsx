import { useGetActivityDetailList } from 'graphqlServer/hooks';
import { ActivityTypeEnum } from 'graphqlServer/queries/activity';

import { useCallback, useEffect, useState } from 'react';
import { formatQueryActivity, TActivity } from 'utils/activity';
import './styles.less';
import { LeaderboardEntry } from './components/LeaderboardEntry';
import { Leaderboard } from './components/Leaderboard';
import { useRouteMatch } from 'react-router-dom';
import CommonLoading from 'components/CommonLoading';
import { useActivityAllowCheck } from 'hooks/activity/useActivityAllowCheck';

export default () => {
  const match = useRouteMatch<{ id: string }>('/activity/:id');
  const { id: pageId } = match?.params || {};

  const getActivityDetailList = useGetActivityDetailList();
  const [isLoading, setIsLoading] = useState(true);
  const [activity, setActivity] = useState<TActivity>();
  const isAllow = useActivityAllowCheck(activity);

  const init = useCallback(async () => {
    try {
      setIsLoading(true);
      setActivity(undefined);

      const result = await getActivityDetailList({
        filter: {
          pageId: {
            _eq: pageId,
          },
        },
        limit: 1,
      });
      const activityDetail = result?.data?.activityList?.[0];
      if (!activityDetail) return;

      const _activity = formatQueryActivity(activityDetail);
      setActivity(_activity);
    } catch (error) {
      console.log('activity init error', error);
    } finally {
      setIsLoading(false);
    }
  }, [getActivityDetailList, pageId]);

  useEffect(() => {
    init();
  }, [init]);

  if (isLoading || !isAllow)
    return (
      <div className="activity-loading">
        <CommonLoading showBg />
      </div>
    );
  if (activity?.type === ActivityTypeEnum.LeaderboardEntry) return <LeaderboardEntry activity={activity} />;

  if (activity?.type === ActivityTypeEnum.Leaderboard) return <Leaderboard activity={activity} />;

  return (
    <div className="activity-loading">
      <CommonLoading showBg />
    </div>
  );
};
