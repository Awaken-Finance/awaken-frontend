import { ILeaderboardActivity } from 'utils/activity';
import './styles.less';
import { ActivityStatusEnum } from 'pages/Activity/hooks/common';
import { LeaderboardRankingMine } from '../LeaderboardRankingMine';
import { LeaderboardRankingList } from '../LeaderboardRankingList';
import { useCallback, useEffect, useState } from 'react';
import { getActivityMyRanking } from 'api/utils/activity';
import { TLeaderboardRankingMine } from 'types/activity';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import { useLeaderboardWS } from 'hooks/activity/useLeaderboardWS';

export type TLeaderboardCountdownProps = {
  activity: ILeaderboardActivity;
  status: ActivityStatusEnum;
};

export const LeaderboardRanking = ({ activity, status }: TLeaderboardCountdownProps) => {
  const { walletInfo } = useConnectWallet();
  const { list } = useLeaderboardWS(activity.id);

  const [myRankingInfo, setMyRankingInfo] = useState<TLeaderboardRankingMine>();
  const initMyRankingInfo = useCallback(async () => {
    const address = walletInfo?.address;
    if (!address) {
      setMyRankingInfo(undefined);
      return;
    }
    try {
      const result = await getActivityMyRanking({
        activityId: activity.id,
        address,
      });
      setMyRankingInfo(result);
    } catch (error) {
      console.log('initMyRankingInfo error', error);
    }
  }, [activity.id, walletInfo?.address]);
  useEffect(() => {
    initMyRankingInfo();
  }, [initMyRankingInfo]);

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
