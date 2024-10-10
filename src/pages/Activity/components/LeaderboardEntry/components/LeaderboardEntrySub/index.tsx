import { ILeaderboardActivity } from 'utils/activity';
import './styles.less';
import { useCmsTranslations } from 'hooks/cms';
import { TLeaderboardInfoTranslations } from 'graphqlServer/queries/activity/leaderboard';
import moment from 'moment';
import { LeaderboardEntryJoin } from '../LeaderboardEntryJoin';
import { LeaderboardRewardList } from 'pages/Activity/components/Leaderboard/components/LeaderboardRewardList';
import { useCallback, useMemo } from 'react';
import { ActivityTypeEnum } from 'graphqlServer/queries/activity';
import { LeaderboardSection } from '../LeaderboardSection';
import { useHistory } from 'react-router-dom';

export type TLeaderboardEntrySubProps = {
  activity: ILeaderboardActivity;
};

export const LeaderboardEntrySub = ({ activity }: TLeaderboardEntrySubProps) => {
  const t = useCmsTranslations<TLeaderboardInfoTranslations>(activity.info.translations);

  const rewardList = useMemo(
    () => activity.info.rewardList.map((item) => item.leaderboardRewardList_id),
    [activity.info.rewardList],
  );

  const history = useHistory();
  const onClick = useCallback(
    (event: any) => {
      try {
        if (event.target.tagName.toLowerCase() === 'a') {
          event.preventDefault();
          const link = event.target;
          history.push(link.attributes['href'].value);
        }
      } catch (error) {
        console.log(error, '===err');
      }
    },
    [history],
  );

  if (activity.type !== ActivityTypeEnum.Leaderboard) return <></>;

  return (
    <LeaderboardSection className="leaderboard-entry-sub">
      <div className="leaderboard-entry-sub-header">
        <div className="leaderboard-entry-sub-header-title">{t('activityName')}</div>
        <div className="leaderboard-entry-sub-header-tip">{t('labelTag')}</div>
      </div>

      {t('description') && (
        <div
          onClick={onClick}
          className="leaderboard-entry-sub-description"
          dangerouslySetInnerHTML={{ __html: t('description') || '' }}></div>
      )}

      <div className="leaderboard-entry-sub-period">
        <span>{`${t('periodTitle')}:`}</span>
        <span>{`${moment(activity.startTime).utc().format('YYYY-MM-DD HH:mm')} -- ${moment(activity.endTime)
          .utc()
          .format('YYYY-MM-DD HH:mm')} UTC`}</span>
      </div>

      <LeaderboardEntryJoin className="leaderboard-entry-join-section" activity={activity} />

      <div className="leaderboard-entry-reward-section">
        <div className="leaderboard-entry-reward-section-title">{t('rewardSectionTitle')}</div>

        <LeaderboardRewardList list={rewardList} />
      </div>

      <div className="leaderboard-entry-rule-section">
        <div className="leaderboard-entry-rule-section-title">{t('ruleSectionTitle')}</div>
        {t('ruleContent') && (
          <div
            className="leaderboard-entry-rule-section-content"
            dangerouslySetInnerHTML={{ __html: t('ruleContent') || '' }}></div>
        )}
      </div>
    </LeaderboardSection>
  );
};
