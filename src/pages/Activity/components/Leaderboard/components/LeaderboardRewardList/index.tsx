import {
  TLeaderboardRewardTranslations,
  TQueryLeaderboardReward,
} from 'graphqlServer/queries/activity/leaderboardReward';
import './styles.less';
import { S3Image } from 'components/S3Image';
import { useCmsTranslations } from 'hooks/cms';

export type TLeaderboardRewardItemProps = {
  item: TQueryLeaderboardReward;
};

const LeaderboardRewardItem = ({ item }: TLeaderboardRewardItemProps) => {
  const t = useCmsTranslations<TLeaderboardRewardTranslations>(item.translations);

  return (
    <div className="leaderboard-reward-list-box">
      <div className="leaderboard-reward-list-box-header">
        {item.icon && <S3Image uri={item.icon?.filename_disk} />}
        <div className="leaderboard-reward-list-box-title">{t('title')}</div>
      </div>
      <div className="leaderboard-reward-list-box-content">
        <div className="leaderboard-reward-list-box-description">{t('description')}</div>
        {t('subDescription') && (
          <div className="leaderboard-reward-list-box-sub-description">{t('subDescription')}</div>
        )}
      </div>
    </div>
  );
};

export type TLeaderboardRewardListProps = {
  list: TQueryLeaderboardReward[];
};

export const LeaderboardRewardList = ({ list }: TLeaderboardRewardListProps) => {
  return (
    <div className="leaderboard-reward-list">
      {list.map((item) => (
        <LeaderboardRewardItem key={item.id} item={item} />
      ))}
    </div>
  );
};
