import { useGetActivityDetailList } from 'graphqlServer/hooks';
import { ActivityTypeEnum } from 'graphqlServer/queries/activity';

import { useCallback, useEffect, useState } from 'react';
import { formatQueryActivity, TActivity } from 'utils/activity';
import './styles.less';
import { LeaderboardEntry } from './components/LeaderboardEntry';
import { Leaderboard } from './components/Leaderboard';
import { useHistory, useRouteMatch } from 'react-router-dom';
import CommonLoading from 'components/CommonLoading';
import { useActivityAllowCheck } from 'hooks/activity/useActivityAllowCheck';
import { handleLoopFetch } from 'utils';

export default () => {
  const match = useRouteMatch<{ id: string }>('/activity/:id');
  const { id: pageId } = match?.params || {};

  const getActivityDetailList = useGetActivityDetailList();
  const [isLoading, setIsLoading] = useState(true);
  const [activity, setActivity] = useState<TActivity>();
  const isAllow = useActivityAllowCheck(activity);

  const history = useHistory();
  const init = useCallback(async () => {
    try {
      setIsLoading(true);
      setActivity(undefined);

      const result = await handleLoopFetch({
        fetch: () =>
          getActivityDetailList({
            filter: {
              pageId: {
                _eq: pageId,
              },
            },
            limit: 1,
          }),
        times: 5,
        interval: 2500,
      });

      const activityDetail = result?.data?.activityList?.[0];
      if (!activityDetail) return;

      const _activity = formatQueryActivity(activityDetail);
      setActivity(_activity);
    } catch (error) {
      console.log('activity init error', error);
      history.replace('/');
    } finally {
      setIsLoading(false);
    }
  }, [getActivityDetailList, history, pageId]);

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
