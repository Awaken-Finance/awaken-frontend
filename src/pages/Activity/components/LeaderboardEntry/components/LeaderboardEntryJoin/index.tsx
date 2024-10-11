import { ILeaderboardActivity } from 'utils/activity';
import './styles.less';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
import { IS_MAIN_NET } from 'constants/index';
import { getValidAddress } from 'utils/wallet';

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
  const statusRef = useRef(status);
  statusRef.current = status;

  const isConnected = useIsConnected();
  const { isLocking, walletInfo, walletType } = useConnectWallet();
  const [isJoined, setIsJoined] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const init = useCallback(async () => {
    const address = walletInfo?.address;
    if (!address) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { status: _status } = await getActivityJoinStatus({
        activityId: Number(activity.serviceId || 0),
        address,
      });

      setIsJoined(!!_status);
    } catch (error) {
      console.log('initMyRankingInfo error', error);
    } finally {
      setIsLoading(false);
    }
  }, [activity.serviceId, walletInfo?.address]);
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

    if (activity.whitelist && walletInfo?.address) {
      const whitelist = activity.whitelist.map((item) => getValidAddress(item));
      if (whitelist.includes(walletInfo.address)) {
        return {
          label: t('fulfilledJoinBtn') || '',
          active: true,
          type: 'primary',
        };
      }
    }

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
  }, [activity.whitelist, isConnected, isJoined, isLocking, localT, status, t, walletInfo?.address]);

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

  const emitGTag = useCallback(() => {
    try {
      gtag &&
        gtag('event', `${IS_MAIN_NET ? '' : 'test_'}activity_${location?.pathname?.split('/')?.reverse()?.[0] || ''}`, {
          event_category: 'button',
          event_label: 'LeaderboardEntryJoin',
          value: 1,
          address: walletInfo?.address || '',
          walletType: walletType,
          activityStatus: ActivityStatusEnum[status],
          joinActivityPageId: activity.pageId,
        });
    } catch (error) {
      console.log('emitGTag error', error);
    }
  }, [activity.pageId, status, walletInfo?.address, walletType]);

  const onClick = useCallback(async () => {
    emitGTag();
    if (isJoined) return history.push(`/activity/${activity.pageId}`);
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
        activityId: Number(activity.serviceId || 0),
      });
    } catch (error) {
      console.log('join error', error);
    } finally {
      setIsLoading(false);
      setIsJoined(true);
      if (statusRef.current === ActivityStatusEnum.Execution) {
        history.push(`/activity/${activity.pageId}`);
      }
    }
  }, [
    activity.info.signPlainText,
    activity.pageId,
    activity.serviceId,
    emitGTag,
    getActivitySign,
    history,
    isJoined,
    walletInfo?.address,
  ]);

  return (
    <div className={clsx(['leaderboard-entry-join', className])}>
      <div className="leaderboard-entry-join-title">{statusInfo.title}</div>
      {status !== ActivityStatusEnum.Completion && <ActivityCountdown endTime={statusInfo.endTime} />}

      <AuthBtn
        className="leaderboard-entry-join-btn"
        type={btnLabelInfo.type}
        size="large"
        onClick={onClick}
        onGotoLogin={emitGTag}
        loading={isLoading}
        disabled={!btnLabelInfo.active}>
        <Font size={18} color={btnLabelInfo.fontColor} weight="medium">
          {btnLabelInfo.label}
        </Font>
      </AuthBtn>
    </div>
  );
};
