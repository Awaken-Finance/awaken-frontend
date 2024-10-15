import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import { setActivityJoin } from 'api/utils/activity';
import AuthBtn from 'Buttons/AuthBtn';
import Font from 'components/Font';
import { IS_MAIN_NET } from 'constants/index';
import { TLeaderboardInfoTranslations } from 'graphqlServer/queries/activity/leaderboard';
import { useGetActivitySign } from 'hooks/activity/useGetActivitySign';
import { useCmsTranslations } from 'hooks/cms';
import { useIsConnected } from 'hooks/useLogin';
import { ActivityStatusEnum } from 'pages/Activity/hooks/common';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { ILeaderboardActivity } from 'utils/activity';
import { FontColor } from 'utils/getFontStyle';

export type TLeaderboardJoinStatus = {
  isJoined: boolean;
  isLoading: boolean;
};
export type TLeaderboardExecuteBtnProps = {
  activity: ILeaderboardActivity;
  status: ActivityStatusEnum;
  className?: string;
  extraId?: string;
  joinStatus: TLeaderboardJoinStatus;
};

export const LeaderboardExecuteBtn = ({
  activity,
  status,
  className,
  extraId,
  joinStatus,
}: TLeaderboardExecuteBtnProps) => {
  const t = useCmsTranslations<TLeaderboardInfoTranslations>(activity.info.translations);
  const { t: localT } = useTranslation();

  const isConnected = useIsConnected();
  const { isLocking, walletInfo, walletType } = useConnectWallet();

  const [_isJoined, setIsJoined] = useState(false);
  const isJoined = useMemo(() => _isJoined || joinStatus.isJoined, [_isJoined, joinStatus.isJoined]);
  const [_isLoading, setIsLoading] = useState(false);
  const isLoading = useMemo(() => _isLoading || joinStatus.isLoading, [_isLoading, joinStatus.isLoading]);
  const getActivitySign = useGetActivitySign();
  const statusRef = useRef(status);
  statusRef.current = status;

  const btnLabelInfo = useMemo<{
    active?: boolean;
    label: string;
    fontColor?: FontColor;
    type?: 'primary';
  }>(() => {
    if (!isConnected)
      return { label: localT(isLocking ? 'Unlock' : 'connectWallet'), fontColor: 'primary', active: true };

    if (status === ActivityStatusEnum.Completion) {
      return {
        label: t('expiredExecuteBtn') || '',
        fontColor: 'two',
      };
    }
    if (!isJoined)
      return {
        label: t('joinBtn') || '',
        active: true,
        type: 'primary',
      };

    switch (status) {
      case ActivityStatusEnum.Preparation:
        return {
          label: t('prepareToExecuteBtn') || '',
          fontColor: 'two',
        };

      case ActivityStatusEnum.Execution:
        return {
          label: t('executeBtn') || '',
          active: true,
          type: 'primary',
        };
      default:
        return {
          label: t('expiredExecuteBtn') || '',
          fontColor: 'two',
        };
    }
  }, [isConnected, isJoined, isLocking, localT, status, t]);

  const emitGTag = useCallback(() => {
    try {
      gtag &&
        gtag('event', `${IS_MAIN_NET ? '' : 'test_'}activity_${activity.pageId || ''}`, {
          event_category: 'button',
          event_label: `LeaderboardExecute${extraId || ''}`,
          value: 1,
          address: walletInfo?.address || '',
          walletType: walletType,
          activityStatus: ActivityStatusEnum[status],
        });
    } catch (error) {
      console.log('emitGTag error', error);
    }
  }, [activity.pageId, extraId, status, walletInfo?.address, walletType]);

  const history = useHistory();
  const onClick = useCallback(async () => {
    emitGTag();
    if (isJoined) return history.push(activity.info.executeBtnLink);

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
        history.push(activity.info.executeBtnLink);
      }
    }
  }, [
    activity.info.executeBtnLink,
    activity.info.signPlainText,
    activity.serviceId,
    emitGTag,
    getActivitySign,
    history,
    isJoined,
    walletInfo?.address,
  ]);

  return (
    <AuthBtn
      className={className}
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
  );
};
