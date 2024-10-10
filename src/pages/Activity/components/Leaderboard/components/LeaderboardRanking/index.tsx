import { ILeaderboardActivity } from 'utils/activity';
import './styles.less';
import { ActivityStatusEnum } from 'pages/Activity/hooks/common';
import { LeaderboardRankingMine } from '../LeaderboardRankingMine';
import { LeaderboardRankingList } from '../LeaderboardRankingList';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getActivityMyRanking, getActivityRankingList } from 'api/utils/activity';
import { TLeaderboardRankingItem, TLeaderboardRankingMine } from 'types/activity';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import { useLeaderboardWS } from 'hooks/activity/useLeaderboardWS';

export type TLeaderboardCountdownProps = {
  activity: ILeaderboardActivity;
  status: ActivityStatusEnum;
};

export const LeaderboardRanking = ({ activity, status }: TLeaderboardCountdownProps) => {
  const { walletInfo } = useConnectWallet();

  const [myRankingInfo, setMyRankingInfo] = useState<TLeaderboardRankingMine>();
  const initMyRankingInfo = useCallback(async () => {
    const address = walletInfo?.address;
    if (!address) {
      setMyRankingInfo(undefined);
      return;
    }
    try {
      const result = await getActivityMyRanking({
        activityId: Number(activity.serviceId || 0),
        address,
      });
      setMyRankingInfo(result);
    } catch (error) {
      console.log('initMyRankingInfo error', error);
    }
  }, [activity.serviceId, walletInfo?.address]);

  useEffect(() => {
    initMyRankingInfo();
  }, [initMyRankingInfo]);

  const [apiList, setApiList] = useState<TLeaderboardRankingItem[]>();
  const [isInit, setIsInit] = useState(false);
  const initRankingList = useCallback(async () => {
    try {
      const result = await getActivityRankingList({
        activityId: Number(activity.serviceId || 0),
      });
      setApiList(result);
    } catch (error) {
      console.log('initRankingList error', error);
    } finally {
      setIsInit(true);
    }
  }, [activity.serviceId]);
  useEffect(() => {
    initRankingList();
  }, [initRankingList]);

  const { list: wsList } = useLeaderboardWS(isInit, activity.serviceId || 0);
  const list = useMemo(() => wsList || apiList || [], [apiList, wsList]);

  if (status === ActivityStatusEnum.Preparation) return <></>;

  return (
    <div className="leaderboard-ranking">
      {myRankingInfo && (
        <LeaderboardRankingMine
          className="leaderboard-ranking-mine-section"
          activity={activity}
          status={status}
          list={list}
          info={myRankingInfo}
        />
      )}

      {list && !!list.length && <LeaderboardRankingList activity={activity} list={list} />}
    </div>
  );
};
