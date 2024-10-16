import { ILeaderboardActivity } from 'utils/activity';
import './styles.less';
import { IconLeaderboardCrown } from 'assets/icons';
import { TLeaderboardInfoTranslations } from 'graphqlServer/queries/activity/leaderboard';
import { useCmsTranslations } from 'hooks/cms';
import { LeaderboardExecuteBtn, TLeaderboardJoinStatus } from '../LeaderboardExecuteBtn';
import { ActivityStatusEnum } from 'pages/Activity/hooks/common';
import { LeaderboardProgress } from '../LeaderboardProgress';
import { LeaderboardSection } from 'pages/Activity/components/LeaderboardEntry/components/LeaderboardSection';
import { TLeaderboardRankingItem, TLeaderboardRankingMine } from 'types/activity';
import { formatPriceUSD } from 'utils/price';
import { useMemo } from 'react';
import {
  getLeaderboardActualRewardsMap,
  getLeaderboardRewardsMap,
  getPreRewardRanking,
} from 'utils/activity/leaderboard';
import { ZERO } from 'constants/misc';
import BigNumber from 'bignumber.js';

export type TLeaderboardRankingMineProps = {
  activity: ILeaderboardActivity;
  status: ActivityStatusEnum;
  className?: string;
  list: TLeaderboardRankingItem[];
  info?: TLeaderboardRankingMine;
  joinStatus: TLeaderboardJoinStatus;
};

const INVALID_RANKING_NUMBER = 1001;

export const LeaderboardRankingMine = ({
  activity,
  status,
  className,
  info,
  list,
  joinStatus,
}: TLeaderboardRankingMineProps) => {
  const t = useCmsTranslations<TLeaderboardInfoTranslations>(activity.info.translations);
  const rewardsMap = useMemo(() => getLeaderboardRewardsMap(activity), [activity]);

  const isChampion = useMemo(() => info?.ranking === 1, [info?.ranking]);
  const isProgressShow = useMemo(() => !!list.length, [list.length]);
  const rewardsAmount = useMemo(() => getPreRewardRanking(activity, INVALID_RANKING_NUMBER), [activity]);

  const isWinTipShow = useMemo(
    () => status === ActivityStatusEnum.Completion && (info?.ranking || INVALID_RANKING_NUMBER) <= rewardsAmount,
    [info?.ranking, rewardsAmount, status],
  );

  const isEncourageTipShow = useMemo(
    () => status === ActivityStatusEnum.Completion && (info?.ranking || INVALID_RANKING_NUMBER) > rewardsAmount,
    [info?.ranking, rewardsAmount, status],
  );

  const actualRewardsMap = useMemo(
    () => getLeaderboardActualRewardsMap(activity, list.length),
    [activity, list.length],
  );

  const renderInfo = useMemo(() => {
    if (!info) return undefined;
    return {
      rankingVal: (() => {
        if (info.ranking === 0) return '--';
        return info.ranking >= INVALID_RANKING_NUMBER ? '#1000+' : `#${info.ranking}`;
      })(),
      rewards: (() => {
        const rewardInfo = rewardsMap[info?.ranking];
        if (!rewardInfo) return undefined;
        if (!rewardInfo.isShare) return `$${rewardInfo.reward}`;

        return `$${actualRewardsMap[info?.ranking] || '0'}`;
      })(),
    };
  }, [actualRewardsMap, info, rewardsMap]);

  const preRewardInfo = useMemo(() => {
    if (!info)
      return {
        percent: 100,
      };
    const _preRewardRanking = getPreRewardRanking(activity, info.ranking || 10000);
    activity.info.rewardList;
    const preRewardRanking = Math.min(_preRewardRanking, list.length);
    const preTotalPoint = list[preRewardRanking - 1]?.totalPoint || info.totalPoint;
    const diffPoint = BigNumber.max(ZERO, ZERO.plus(preTotalPoint).minus(info.totalPoint).dp(2).toString());

    return {
      preRewardRanking,
      percent: ZERO.eq(preTotalPoint) ? 0 : ZERO.plus(info.totalPoint).div(preTotalPoint).times(100).dp(2).toNumber(),
      distance: `${t('distanceToPrefix')}${preRewardRanking}: ${activity.info.pointPrefix || ''}${formatPriceUSD(
        diffPoint,
      )}${activity.info.pointUnit || ''}`,
      rewards: (() => {
        const rewardInfo = rewardsMap[preRewardRanking];
        if (!rewardInfo) return '';
        if (!rewardInfo.isShare) return `$${rewardInfo.reward}`;

        return `$${actualRewardsMap[preRewardRanking]}`;
      })(),
    };
  }, [activity, actualRewardsMap, info, list, rewardsMap, t]);

  return (
    <LeaderboardSection containerClassName={className} className="leaderboard-ranking-mine">
      <div className="leaderboard-ranking-mine-header">
        <div className="leaderboard-ranking-mine-title">
          <IconLeaderboardCrown />
          {t('myRankingTitle')}
        </div>
      </div>

      {isWinTipShow && <div className="leaderboard-ranking-mine-win-tip">{`🎉 ${t('congratulatoryCopy') || ''}`}</div>}

      {isEncourageTipShow && (
        <div className="leaderboard-ranking-mine-win-tip leaderboard-ranking-mine-encourage-tip">{`🙁 ${
          t('encouragingCopy') || ''
        }`}</div>
      )}

      <div className="leaderboard-ranking-mine-detail">
        <div className="leaderboard-ranking-mine-detail-info">
          <div className="leaderboard-ranking-mine-detail-box">
            <div className="leaderboard-ranking-mine-detail-box-title">{t('totalVolumeLabel')}</div>
            <div className="leaderboard-ranking-mine-detail-box-content">{`${
              activity.info.pointPrefix || ''
            }${formatPriceUSD(info?.totalPoint || '0')}${activity.info.pointUnit || ''}`}</div>
          </div>

          <div className="leaderboard-ranking-mine-detail-box">
            <div className="leaderboard-ranking-mine-detail-box-title">{t('rankingLabel')}</div>
            <div className="leaderboard-ranking-mine-detail-box-content">{`${renderInfo?.rankingVal || '--'}`}</div>
          </div>

          {renderInfo?.rewards && (
            <div className="leaderboard-ranking-mine-detail-box">
              <div className="leaderboard-ranking-mine-detail-box-title">{t('rewardsLabel')}</div>
              <div className="leaderboard-ranking-mine-detail-box-content leaderboard-ranking-mine-detail-box-rewards">
                {renderInfo?.rewards || ''}
              </div>
            </div>
          )}
        </div>

        {status === ActivityStatusEnum.Execution && (
          <LeaderboardExecuteBtn
            activity={activity}
            status={status}
            extraId="Mine"
            className="leaderboard-ranking-mine-detail-btn"
            joinStatus={joinStatus}
          />
        )}
      </div>

      {!isChampion && isProgressShow && (
        <>
          <div className="leaderboard-ranking-mine-expect-wrap">
            <div className="leaderboard-ranking-mine-expect-wrap-header">{`${t('expectedRewardsLabel')} (Top ${
              preRewardInfo.preRewardRanking
            })`}</div>
            <div className="leaderboard-ranking-mine-expect-wrap-content">{preRewardInfo.rewards}</div>
          </div>
          <LeaderboardProgress percent={preRewardInfo.percent} tipContent={preRewardInfo.distance} />
        </>
      )}
    </LeaderboardSection>
  );
};
