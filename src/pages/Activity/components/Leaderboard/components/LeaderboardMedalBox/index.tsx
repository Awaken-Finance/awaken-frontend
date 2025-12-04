import { GradientBorder } from 'components/GradientBorder';
import './styles.less';
import { IconMedal1, IconMedal2, IconMedal3 } from 'assets/icons';
import { ILeaderboardActivity } from 'utils/activity';
import { TLeaderboardInfoTranslations } from 'graphqlServer/queries/activity/leaderboard';
import { useCmsTranslations } from 'hooks/cms';
import { useMemo } from 'react';
import clsx from 'clsx';

export enum LeaderboardMedalTypeEnum {
  '1st' = 1,
  '2nd',
  '3rd',
}

export type TLeaderboardMedalBoxProps = {
  activity: ILeaderboardActivity;
  type: LeaderboardMedalTypeEnum;
  address?: string;
  volume?: string;
  rewards?: string;
};

const LeaderboardMedalBoxInfoMap = {
  [LeaderboardMedalTypeEnum['1st']]: {
    medalIcon: <IconMedal1 />,
    borderColor: 'linear-gradient(180deg, #F4CF6D 0%, rgba(244, 207, 109, 0.2) 100%)',
    className: 'leaderboard-medal-box-1st-wrap',
  },
  [LeaderboardMedalTypeEnum['2nd']]: {
    medalIcon: <IconMedal2 />,
    borderColor: 'linear-gradient(180deg, #C2ECF3 0%, rgba(194, 236, 243, 0.2) 100%)',
    className: 'leaderboard-medal-box-2nd-wrap',
  },
  [LeaderboardMedalTypeEnum['3rd']]: {
    medalIcon: <IconMedal3 />,
    borderColor: 'linear-gradient(180deg, #D19E73 0%, rgba(209, 158, 115, 0.2) 100%)',
    className: 'leaderboard-medal-box-3rd-wrap',
  },
};

export const LeaderboardMedalBox = ({ activity, type, address, volume, rewards }: TLeaderboardMedalBoxProps) => {
  const t = useCmsTranslations<TLeaderboardInfoTranslations>(activity.info.translations);

  const info = useMemo(
    () => LeaderboardMedalBoxInfoMap[type] || LeaderboardMedalBoxInfoMap[LeaderboardMedalTypeEnum['3rd']],
    [type],
  );

  return (
    <GradientBorder
      containerClassName={clsx(['leaderboard-medal-box-wrap', info.className])}
      borderColor={info.borderColor}
      backgroundColor="#1E212B"
      className="leaderboard-medal-box">
      {info.medalIcon}
      <div className="leaderboard-medal-box-address">{address || '-'}</div>
      <div className="leaderboard-medal-box-content">
        <div className="leaderboard-medal-box-box">
          <div className="leaderboard-medal-box-box-title">{t('totalVolumeLabel')}</div>
          <div className="leaderboard-medal-box-box-content">{volume || '-'}</div>
        </div>

        <div className="leaderboard-medal-box-box">
          <div className="leaderboard-medal-box-box-title">{t('expectedRewardsLabel')}</div>
          <div className="leaderboard-medal-box-box-content">{rewards || '-'}</div>
        </div>
      </div>
    </GradientBorder>
  );
};
