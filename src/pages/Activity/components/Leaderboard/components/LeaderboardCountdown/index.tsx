import { ILeaderboardActivity } from 'utils/activity';
import './styles.less';
import { useCmsTranslations } from 'hooks/cms';
import { TLeaderboardInfoTranslations } from 'graphqlServer/queries/activity/leaderboard';
import { ActivityStatusEnum } from 'pages/Activity/hooks/common';
import { useMemo } from 'react';
import { ActivityCountdown } from 'pages/Activity/components/common/ActivityCountdown';

export type TLeaderboardCountdownProps = {
  activity: ILeaderboardActivity;
  status: ActivityStatusEnum;
};
type TLeaderboardCountdownStatusInfo = {
  title: string;
  endTime: string;
};

export const LeaderboardCountdown = ({ activity, status }: TLeaderboardCountdownProps) => {
  const t = useCmsTranslations<TLeaderboardInfoTranslations>(activity.info.translations);

  const statusInfo = useMemo<TLeaderboardCountdownStatusInfo>(() => {
    switch (status) {
      case ActivityStatusEnum.Preparation:
        return {
          title: t('countDownStartLabel') || '',
          endTime: activity.startTime,
        };
      case ActivityStatusEnum.Execution:
        return {
          title: t('countDownEndLabel') || '',
          endTime: activity.endTime,
        };
      default:
        return {
          title: '',
          endTime: activity.endTime,
        };
    }
  }, [activity.endTime, activity.startTime, status, t]);

  return (
    <div className="leaderboard-countdown">
      <div className="leaderboard-countdown-title">{statusInfo.title}</div>
      <ActivityCountdown endTime={statusInfo.endTime} isRow />
    </div>
  );
};
