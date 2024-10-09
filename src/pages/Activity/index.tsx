import { useGetActivityDetail } from 'graphqlServer/hooks';
import { ActivityTypeEnum, TQueryActivity } from 'graphqlServer/queries/activity';
import { TQueryLeaderboardEntryInfo } from 'graphqlServer/queries/activity/leaderboardEntry';
import { useCallback, useEffect, useState } from 'react';
import { formatQueryActivity, TActivity } from 'utils/activity';
import './styles.less';
import { LeaderboardEntry } from './components/LeaderboardEntry';
import { Leaderboard } from './components/Leaderboard';
import { useRouteMatch } from 'react-router-dom';
import CommonLoading from 'components/CommonLoading';

export default () => {
  const match = useRouteMatch<{ id: string }>('/activity/:id');
  const { id } = match?.params || {};

  const getActivityDetail = useGetActivityDetail();
  const [isLoading, setIsLoading] = useState(true);
  const [activity, setActivity] = useState<TActivity>();

  const init = useCallback(async () => {
    try {
      setIsLoading(true);
      setActivity(undefined);
      const result = await getActivityDetail({ id: Number(id) });

      const activityDetail = result.data as TQueryActivity<TQueryLeaderboardEntryInfo>;
      const _activity = formatQueryActivity(activityDetail);
      setActivity(_activity);
    } catch (error) {
      console.log('activity init error', error);
    } finally {
      setIsLoading(false);
    }
  }, [getActivityDetail, id]);

  useEffect(() => {
    init();
  }, [init]);

  if (isLoading)
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
