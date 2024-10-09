import { useCallback, useEffect, useState } from 'react';
import SignalR from 'socket/signalr';
import { TLeaderboardRankingItem } from 'types/activity';

export const useLeaderboardWS = (activityId: number | string) => {
  const [socket, setSocket] = useState<SignalR | null>(null);

  useEffect(() => {
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
      setTimeout(() => {
        signalR?.destroy();
      }, 500);
    };
  }, []);

  const [list, setList] = useState<TLeaderboardRankingItem[]>([]);
  const updateRankingList = useCallback((data?: { items: TLeaderboardRankingItem[] }) => {
    console.log('updateRankingList', data);
    setList(data?.items || []);
  }, []);

  useEffect(() => {
    socket?.RequestActivityRankingList(Number(activityId));
    socket?.on('ReceiveActivityRankingList', updateRankingList);

    return () => {
      socket?.UnsubscribeActivityRankingList(Number(activityId));
    };
  }, [activityId, socket, updateRankingList]);

  return {
    list,
  };
};
