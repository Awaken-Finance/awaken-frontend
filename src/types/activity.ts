export type TLeaderboardRankingItem = {
  ranking: number;
  address: string;
  rankingChange1H: number;
  totalPoint: number;
  newStatus: number;
};

export type TLeaderboardRankingMine = {
  ranking: number;
  totalPoint: number;
};

export type TActivityJoinStatus = {
  status: 0 | 1;
  numberOfJoin: number;
};
