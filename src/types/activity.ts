export type TLeaderboardRankingItem = {
  ranking: number;
  address: string;
  rankingChange1H: number;
  totalPoint: string;
  newStatus: number;
};

export type TLeaderboardRankingMine = {
  ranking: number;
  totalPoint: string;
};

export type TActivityJoinStatus = {
  status: 0 | 1;
  numberOfJoin: number;
};
