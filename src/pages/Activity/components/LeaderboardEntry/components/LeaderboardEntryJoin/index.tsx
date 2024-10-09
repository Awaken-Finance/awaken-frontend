import { ILeaderboardActivity } from 'utils/activity';
import './styles.less';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useCmsTranslations } from 'hooks/cms';
import { TLeaderboardInfoTranslations } from 'graphqlServer/queries/activity/leaderboard';
import clsx from 'clsx';
import { ActivityStatusEnum, useActivityStatus } from 'pages/Activity/hooks/common';
import { ActivityCountdown } from 'pages/Activity/components/common/ActivityCountdown';
import { useIsConnected } from 'hooks/useLogin';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import { useTranslation } from 'react-i18next';
import { FontColor } from 'utils/getFontStyle';
import AuthBtn from 'Buttons/AuthBtn';
import Font from 'components/Font';
import { getActivityJoinStatus, setActivityJoin } from 'api/utils/activity';
import { useHistory } from 'react-router-dom';
import { useGetActivitySign } from 'hooks/activity/useGetActivitySign';

export type TLeaderboardEntryCountDownProps = {
  activity: ILeaderboardActivity;
  className?: string;
};

type TActivityStatusInfo = {
  title: string;
  endTime: string;
};

export const LeaderboardEntryJoin = ({ activity, className }: TLeaderboardEntryCountDownProps) => {
  const t = useCmsTranslations<TLeaderboardInfoTranslations>(activity.info.translations);
  const { t: localT } = useTranslation();
  const getActivitySign = useGetActivitySign();

  const status = useActivityStatus({
    startTime: activity.startTime,
    endTime: activity.endTime,
  });

  const isConnected = useIsConnected();
  const { isLocking, walletInfo } = useConnectWallet();
  const [isJoined, setIsJoined] = useState(false);

  const init = useCallback(async () => {
    const address = walletInfo?.address;
    if (!address) return;

    try {
      const { status: _status } = await getActivityJoinStatus({
        activityId: activity.id,
        address,
      });

      setIsJoined(!!_status);
    } catch (error) {
      console.log('initMyRankingInfo error', error);
    }
  }, [activity.id, walletInfo?.address]);
  useEffect(() => {
    init();
  }, [init]);

  const btnLabelInfo = useMemo<{
    active?: boolean;
    label: string;
    fontColor?: FontColor;
    type?: 'primary';
  }>(() => {
    if (!isConnected)
      return { label: localT(isLocking ? 'Unlock' : 'connectWallet'), fontColor: 'primary', active: true };

    if (!isJoined)
      return {
        label: t('joinBtn') || '',
        active: true,
        type: 'primary',
      };

    switch (status) {
      case ActivityStatusEnum.Preparation:
        return {
          label: t('prepareToJoinBtn') || '',
          fontColor: 'two',
        };

      case ActivityStatusEnum.Execution:
        return {
          label: t('fulfilledJoinBtn') || '',
          active: true,
          type: 'primary',
        };
      default:
        return {
          label: t('expiredJoinBtn') || '',
          fontColor: 'two',
        };
    }
  }, [isConnected, isJoined, isLocking, localT, status, t]);

  const statusInfo = useMemo<TActivityStatusInfo>(() => {
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

  const history = useHistory();
  const [isLoading, setIsLoading] = useState(false);
  const onClick = useCallback(async () => {
    if (isJoined) return history.push(`/activity/${activity.id}`);
    setIsLoading(true);
    let signResult: { plainText: string; signature: string; pubkey: string };
    try {
      signResult = await getActivitySign(activity.info.signPlainText);
    } catch (error) {
      setIsLoading(false);
      return;
    }

    try {
      await setActivityJoin({
        message: signResult.plainText,
        signature: signResult.signature,
        publicKey: signResult.pubkey,
        address: walletInfo?.address || '',
        activityId: activity.id,
      });
    } catch (error) {
      console.log('join error', error);
    } finally {
      setIsLoading(false);
      setIsJoined(true);
    }
  }, [activity.id, activity.info.signPlainText, getActivitySign, history, isJoined, walletInfo?.address]);

  return (
    <div className={clsx(['leaderboard-entry-join', className])}>
      <div className="leaderboard-entry-join-title">{statusInfo.title}</div>
      {status !== ActivityStatusEnum.Completion && <ActivityCountdown endTime={statusInfo.endTime} />}

      <AuthBtn
        className="leaderboard-entry-join-btn"
        type={btnLabelInfo.type}
        size="large"
        onClick={onClick}
        loading={isLoading}
        disabled={!btnLabelInfo.active}>
        <Font size={18} color={btnLabelInfo.fontColor} weight="medium">
          {btnLabelInfo.label}
        </Font>
      </AuthBtn>
    </div>
  );
};
