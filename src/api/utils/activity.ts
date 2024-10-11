import { request } from 'api';
import { TActivityJoinStatus, TLeaderboardRankingItem, TLeaderboardRankingMine } from 'types/activity';
import { TCommonAPIResult } from 'types/common';

export type TGetActivityRankingListParams = {
  activityId: string | number;
};
export const getActivityRankingList = async ({ activityId }: TGetActivityRankingListParams) => {
  const res: TCommonAPIResult<{
    items: TLeaderboardRankingItem[];
  }> = await request.activity.GET_ACTIVITY_RANKING_LIST({
    params: {
      activityId,
    },
  });
  return res.data.items;
};

export type TGetActivityMyRankingParams = {
  activityId: string | number;
  address: string;
};
export const getActivityMyRanking = async ({ activityId, address }: TGetActivityMyRankingParams) => {
  const res: TCommonAPIResult<TLeaderboardRankingMine> = await request.activity.GET_ACTIVITY_MY_RANKING({
    params: {
      activityId,
      address,
    },
  });
  return res.data;
};

export type TGetActivityJoinStatusParams = {
  activityId: string | number;
  address: string;
};
export const getActivityJoinStatus = async ({ activityId, address }: TGetActivityJoinStatusParams) => {
  const res: TCommonAPIResult<TActivityJoinStatus> = await request.activity.GET_ACTIVITY_JOIN_STATUS({
    params: {
      activityId,
      address,
    },
  });
  return res.data;
};

export type TSetActivityJoinParams = {
  message: string;
  signature: string;
  publicKey: string;
  address: string;
  activityId: number | string;
};
export const setActivityJoin = async (params: TSetActivityJoinParams) => {
  const res: TCommonAPIResult<null> = await request.activity.SET_ACTIVITY_JOIN({
    method: 'POST',
    data: params,
  });
  return res.code === 20000;
};
