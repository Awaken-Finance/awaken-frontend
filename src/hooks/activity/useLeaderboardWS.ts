import { useCallback, useEffect, useState } from 'react';
import SignalR from 'socket/signalr';
import { TLeaderboardRankingItem } from 'types/activity';

export type TUseLeaderboardWSParams = {
  isInit: boolean;
  activityId: number | string;
  onUpdate?: () => void;
};
export const useLeaderboardWS = ({ isInit, activityId }: TUseLeaderboardWSParams) => {
  const [socket, setSocket] = useState<SignalR | null>(null);

  useEffect(() => {
    if (!isInit) return;
    const signalR = new SignalR();
    signalR
      .doOpen()
      .then(() => {
        setSocket(signalR);
      })
      .catch((e) => {
        console.log('Leaderboard signalR error', e);
      });

    return () => {
      console.log('signalR destroy');
      signalR?.destroy();
    };
  }, [isInit]);

  const [list, setList] = useState<TLeaderboardRankingItem[]>();
  const updateRankingList = useCallback((data?: { items: TLeaderboardRankingItem[] }) => {
    console.log('updateRankingList', data);
    setList(data?.items || []);
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.RequestActivityRankingList(Number(activityId));
    socket.on('ReceiveActivityRankingList', updateRankingList);

    return () => {
      console.log('signalR UnsubscribeActivityRankingList');
      socket.UnsubscribeActivityRankingList(Number(activityId));
    };
  }, [activityId, socket, updateRankingList]);

  return {
    list,
  };
};
