import { ILeaderboardActivity } from 'utils/activity';
import './styles.less';
import { useCmsTranslations } from 'hooks/cms';
import { TLeaderboardInfoTranslations } from 'graphqlServer/queries/activity/leaderboard';
import moment from 'moment';
import { LeaderboardEntryJoin } from '../LeaderboardEntryJoin';
import { LeaderboardRewardList } from 'pages/Activity/components/Leaderboard/components/LeaderboardRewardList';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityTypeEnum } from 'graphqlServer/queries/activity';
import { LeaderboardSection } from '../LeaderboardSection';
import { ActivityRichText } from 'pages/Activity/components/common/ActivityRichText';
import CommonLink from 'components/CommonLink';
import { useMobile } from 'utils/isMobile';
import { useHistory } from 'react-router-dom';
import { IconLeaderboard } from 'assets/icons';
import { ActivityStatusEnum, useActivityStatus } from 'pages/Activity/hooks/common';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import { getActivityJoinStatus } from 'api/utils/activity';
import { IS_MAIN_NET } from 'constants/index';
import { getActivityLocalJoinStatus, setActivityLocalJoinStatus } from 'utils/activity/activityJoinStatus';

export type TLeaderboardEntrySubProps = {
  activity: ILeaderboardActivity;
};

export const LeaderboardEntrySub = ({ activity }: TLeaderboardEntrySubProps) => {
  const t = useCmsTranslations<TLeaderboardInfoTranslations>(activity.info.translations);
  const isMobile = useMobile();

  const status = useActivityStatus({
    startTime: activity.startTime,
    endTime: activity.endTime,
  });

  const rewardList = useMemo(
    () => activity.info.rewardList.map((item) => item.leaderboardRewardList_id),
    [activity.info.rewardList],
  );

  const { walletInfo, walletType } = useConnectWallet();
  const history = useHistory();
  const onLinkClick = useCallback(() => {
    try {
      gtag &&
        gtag('event', `${IS_MAIN_NET ? '' : 'test_'}activity_${location?.pathname?.split('/')?.reverse()?.[0] || ''}`, {
          event_category: 'button',
          event_label: `LeaderboardEntryRanking`,
          value: 1,
          address: walletInfo?.address || '',
          walletType: walletType,
          activityStatus: ActivityStatusEnum[status],
          joinActivityPageId: activity.pageId,
        });
    } catch (error) {
      console.log('emitGTag error', error);
    }
    history.push(`/activity/${activity.pageId}?anchor=list`);
  }, [activity.pageId, history, status, walletInfo?.address, walletType]);

  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const init = useCallback(async () => {
    const address = walletInfo?.address;
    if (!address) {
      setIsLoading(false);
      return;
    }

    const isJoinedLocal = getActivityLocalJoinStatus(activity.pageId, {
      address,
      serviceId: activity.serviceId || '',
    });
    if (isJoinedLocal) {
      console.log('cache joined');
      setIsJoined(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { status: _status } = await getActivityJoinStatus({
        activityId: Number(activity.serviceId || 0),
        address,
      });

      const _isJoined = !!_status;
      setIsJoined(_isJoined);
      if (_isJoined) {
        setActivityLocalJoinStatus(activity.pageId, {
          address,
          serviceId: activity.serviceId || '',
        });
      }
    } catch (error) {
      console.log('initMyRankingInfo error', error);
    } finally {
      setIsLoading(false);
    }
  }, [activity.pageId, activity.serviceId, walletInfo?.address]);
  useEffect(() => {
    init();
  }, [init]);

  if (activity.type !== ActivityTypeEnum.Leaderboard) return <></>;

  return (
    <LeaderboardSection className="leaderboard-entry-sub">
      <div className="leaderboard-entry-sub-header">
        <div className="leaderboard-entry-sub-header-title">{t('activityName')}</div>
        <div className="leaderboard-entry-sub-header-tip">{t('labelTag')}</div>
        {status !== ActivityStatusEnum.Preparation &&
          (isMobile ? (
            <IconLeaderboard onClick={onLinkClick} className="leaderboard-entry-sub-link" />
          ) : (
            <CommonLink
              onClick={onLinkClick}
              className="leaderboard-entry-sub-link"
              weight="medium"
              size={16}
              lineHeight={24}>
              {t('leaderboardTitle')}
            </CommonLink>
          ))}
      </div>

      {t('description') && (
        <ActivityRichText className="leaderboard-entry-sub-description" innerHTML={t('description') || ''} />
      )}

      <div className="leaderboard-entry-sub-period">
        <span>{`${t('periodTitle')}:`}</span>
        <span>{`${moment(activity.startTime).utc().format('YYYY/MM/DD HH:mm')} - ${moment(activity.endTime)
          .utc()
          .format('YYYY/MM/DD HH:mm')} (UTC)`}</span>
      </div>

      <LeaderboardEntryJoin
        className="leaderboard-entry-join-section"
        activity={activity}
        status={status}
        isJoined={isJoined}
        isLoading={isLoading}
      />

      <div className="leaderboard-entry-reward-section">
        <div className="leaderboard-entry-reward-section-title">{t('rewardSectionTitle')}</div>

        <LeaderboardRewardList list={rewardList} />
      </div>

      <div className="leaderboard-entry-rule-section">
        <div className="leaderboard-entry-rule-section-title">{t('ruleSectionTitle')}</div>
        {t('ruleContent') && (
          <ActivityRichText className="leaderboard-entry-rule-section-content" innerHTML={t('ruleContent') || ''} />
        )}
      </div>
    </LeaderboardSection>
  );
};
