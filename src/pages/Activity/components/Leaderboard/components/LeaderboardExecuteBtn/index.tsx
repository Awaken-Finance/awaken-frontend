import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import AuthBtn from 'Buttons/AuthBtn';
import Font from 'components/Font';
import { IS_MAIN_NET } from 'constants/index';
import { TLeaderboardInfoTranslations } from 'graphqlServer/queries/activity/leaderboard';
import { useCmsTranslations } from 'hooks/cms';
import { useIsConnected } from 'hooks/useLogin';
import { ActivityStatusEnum } from 'pages/Activity/hooks/common';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { ILeaderboardActivity } from 'utils/activity';
import { FontColor } from 'utils/getFontStyle';
export type TLeaderboardExecuteBtnProps = {
  activity: ILeaderboardActivity;
  status: ActivityStatusEnum;
  className?: string;
  extraId?: string;
};

export const LeaderboardExecuteBtn = ({ activity, status, className, extraId }: TLeaderboardExecuteBtnProps) => {
  const t = useCmsTranslations<TLeaderboardInfoTranslations>(activity.info.translations);
  const { t: localT } = useTranslation();

  const isConnected = useIsConnected();
  const { isLocking, walletInfo, walletType } = useConnectWallet();

  const btnLabelInfo = useMemo<{
    active?: boolean;
    label: string;
    fontColor?: FontColor;
    type?: 'primary';
  }>(() => {
    if (!isConnected)
      return { label: localT(isLocking ? 'Unlock' : 'connectWallet'), fontColor: 'primary', active: true };
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
  }, [isConnected, isLocking, localT, status, t]);

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
  const onClick = useCallback(() => {
    emitGTag();
    history.push(activity.info.executeBtnLink);
  }, [activity.info.executeBtnLink, emitGTag, history]);

  return (
    <AuthBtn
      className={className}
      type={btnLabelInfo.type}
      size="large"
      onClick={onClick}
      onGotoLogin={emitGTag}
      disabled={!btnLabelInfo.active}>
      <Font size={18} color={btnLabelInfo.fontColor} weight="medium">
        {btnLabelInfo.label}
      </Font>
    </AuthBtn>
  );
};
