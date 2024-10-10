import {
  ActivityTypeEnum,
  TQueryActivity,
  TQueryActivityInfo,
  TQueryCommonActivity,
} from 'graphqlServer/queries/activity';
import { TActivityBase } from 'graphqlServer/queries/activity/common';
import { TQueryLeaderboardInfo } from 'graphqlServer/queries/activity/leaderboard';
import { TQueryLeaderboardEntryInfo } from 'graphqlServer/queries/activity/leaderboardEntry';
import { formatLeaderboardEntryActivity, formatLeaderboardActivity } from './leaderboard';

export type TLeaderboardEntryInfo = Omit<TQueryLeaderboardEntryInfo, 'children'> & {
  children: ILeaderboardActivity[];
};

export interface ILeaderboardEntryActivity extends TActivityBase {
  type: ActivityTypeEnum.LeaderboardEntry;
  info: TLeaderboardEntryInfo;
}

export interface ILeaderboardActivity extends TActivityBase {
  type: ActivityTypeEnum.Leaderboard;
  info: TQueryLeaderboardInfo;
}

export interface IUnknownActivity extends TActivityBase {
  type: ActivityTypeEnum.Unknown;
}

export type TActivity = ILeaderboardEntryActivity | ILeaderboardActivity | IUnknownActivity;

export const deconstructActivity = <T extends TQueryActivityInfo = TQueryActivityInfo>(
  activityDetail: TQueryCommonActivity,
  type?: ActivityTypeEnum,
): { basicInfo: TActivityBase; info: T } | false => {
  const { infoList, ...basicInfo } = activityDetail || {};
  const info = infoList?.[0];
  if (!info) return false;
  if (type && info?.item?.type !== type) return false;

  return {
    basicInfo,
    info: info.item as any,
  };
};

export const formatQueryActivity = (data: TQueryCommonActivity): TActivity => {
  const detail = deconstructActivity(data);

  if (!detail)
    return {
      ...(data || {}),
      type: ActivityTypeEnum.Unknown,
    };

  const { basicInfo, info } = detail;
  const type = info.type;

  try {
    switch (type) {
      case ActivityTypeEnum.LeaderboardEntry:
        return formatLeaderboardEntryActivity(data);

      case ActivityTypeEnum.Leaderboard:
        return formatLeaderboardActivity(data);

      default:
        throw new Error('activity type error');
    }
  } catch (error) {
    console.log('formatQueryActivity error', error);
    return {
      ...basicInfo,
      type: ActivityTypeEnum.Unknown,
    };
  }
};
