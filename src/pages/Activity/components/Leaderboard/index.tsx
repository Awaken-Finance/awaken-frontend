import { ILeaderboardActivity } from 'utils/activity';
import './styles.less';
import { useCmsTranslations } from 'hooks/cms';
import { TLeaderboardInfoTranslations } from 'graphqlServer/queries/activity/leaderboard';
import { S3Image } from 'components/S3Image';
import { useTranslation } from 'react-i18next';
import { IconArrowLeft } from 'assets/icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { LeaderboardCountdown } from './components/LeaderboardCountdown';
import { LeaderboardRewardList } from './components/LeaderboardRewardList';
import { ActivityStatusEnum, useActivityStatus } from 'pages/Activity/hooks/common';
import { LeaderboardRanking } from './components/LeaderboardRanking';
import { LeaderboardExecuteBtn, TLeaderboardJoinStatus } from './components/LeaderboardExecuteBtn';
import { LeaderboardSection } from '../LeaderboardEntry/components/LeaderboardSection';
import { getActivityJoinStatus } from 'api/utils/activity';
import { ZERO } from 'constants/misc';
import { useMobile } from 'utils/isMobile';
import { ActivityRichText } from '../common/ActivityRichText';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';

export type TLeaderboardProps = {
  activity: ILeaderboardActivity;
};

export const Leaderboard = ({ activity }: TLeaderboardProps) => {
  const isMobile = useMobile();
  const t = useCmsTranslations<TLeaderboardInfoTranslations>(activity.info.translations);
  const { t: localT } = useTranslation();
  const status = useActivityStatus({
    startTime: activity.startTime,
    endTime: activity.endTime,
  });

  const history = useHistory();
  const onBack = useCallback(() => {
    const backBtnLink = activity?.info?.backBtnLink;
    if (backBtnLink) {
      if (!backBtnLink.startsWith('http')) {
        history.push(backBtnLink);
      } else {
        window.open(backBtnLink, '_self');
      }
      return;
    }
    history.goBack();
  }, [activity?.info?.backBtnLink, history]);

  const rewardList = useMemo(
    () => activity.info.rewardList.map((item) => item.leaderboardRewardList_id),
    [activity.info.rewardList],
  );

  const { walletInfo } = useConnectWallet();
  const [numberOfJoin, setNumberOfJoin] = useState(0);
  const [joinStatus, setJoinStatus] = useState<TLeaderboardJoinStatus>({
    isJoined: false,
    isLoading: true,
  });
  const init = useCallback(async () => {
    try {
      const address = walletInfo?.address;

      setJoinStatus((pre) => ({
        ...pre,
        isLoading: !!address,
      }));

      const { numberOfJoin: _numberOfJoin, status: _status } = await getActivityJoinStatus({
        activityId: Number(activity.serviceId || 0),
        address: address || 'empty',
      });
      setNumberOfJoin(_numberOfJoin);
      setJoinStatus({
        isJoined: !!_status,
        isLoading: false,
      });
    } catch (error) {
      console.log('getActivityJoinStatus error', error);
    } finally {
      setJoinStatus((pre) => ({
        ...pre,
        isLoading: false,
      }));
    }
  }, [activity.serviceId, walletInfo?.address]);
  useEffect(() => {
    init();
  }, [init]);
  const isNumberShow = useMemo(
    () => numberOfJoin >= (activity.info.participationShowThreshold || 1000),
    [activity.info.participationShowThreshold, numberOfJoin],
  );
  const numberOfJoinStr = useMemo(() => ZERO.plus(numberOfJoin).toFormat(), [numberOfJoin]);

  return (
    <div className="leaderboard-page">
      <div className="leaderboard-image-wrap">
        {activity.info.backgroundImage && (
          <S3Image className="leaderboard-background-image" uri={activity.info.backgroundImage?.filename_disk} />
        )}
        {activity.info.decorativeImage && (
          <S3Image className="leaderboard-decorative-image" uri={activity.info.decorativeImage?.filename_disk} />
        )}
      </div>

      <div className="leaderboard-page-content">
        <div className="leaderboard-page-header">
          <div className="leaderboard-page-back-btn" onClick={onBack}>
            <IconArrowLeft />
            <span>{localT('back')}</span>
          </div>
        </div>

        <LeaderboardSection
          containerClassName="leaderboard-page-description-wrap"
          className="leaderboard-page-description">
          {isNumberShow && (
            <div className="leaderboard-page-participation-wrap">
              <div className="leaderboard-page-participation">
                <span>{numberOfJoinStr}</span>
                <span>
                  {status === ActivityStatusEnum.Preparation
                    ? t('wantToParticipationSuffix')
                    : t('participationSuffix')}
                </span>
              </div>
            </div>
          )}

          <div className="leaderboard-page-description-header">
            <div className="leaderboard-page-activity-name">{t('activityName')}</div>

            <LeaderboardCountdown activity={activity} status={status} />
          </div>

          <S3Image
            className="leaderboard-page-description-image"
            uri={isMobile ? activity.info.mobileMainImage?.filename_disk : activity.info.mainImage?.filename_disk}
          />

          <LeaderboardExecuteBtn
            activity={activity}
            status={status}
            className="leaderboard-page-description-execute-btn"
            joinStatus={joinStatus}
          />

          <div className="leaderboard-reward-section">
            <div className="leaderboard-reward-section-title">{t('rewardSectionTitle')}</div>

            <LeaderboardRewardList list={rewardList} />
          </div>

          <div className="leaderboard-rule-section">
            <div className="leaderboard-rule-section-title">{t('ruleSectionTitle')}</div>
            {t('ruleContent') && (
              <ActivityRichText className="leaderboard-rule-section-content" innerHTML={t('ruleContent') || ''} />
            )}
          </div>
        </LeaderboardSection>

        <LeaderboardRanking activity={activity} status={status} joinStatus={joinStatus} />
      </div>
    </div>
  );
};
