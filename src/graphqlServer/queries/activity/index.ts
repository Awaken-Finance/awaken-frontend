import { gql } from '@apollo/client';
import { LEADERBOARD_INFO_LIST_FRAGMENT, TQueryLeaderboardInfo } from './leaderboard';
import { LEADERBOARD_INFO_ENTRY_LIST_FRAGMENT, TQueryLeaderboardEntryInfo } from './leaderboardEntry';

import { ACTIVITY_BASE_FRAGMENT, TActivityBase } from './common';

export enum ActivityTypeEnum {
  LeaderboardEntry = 'LeaderboardEntry',
  Leaderboard = 'Leaderboard',
  Unknown = 'Unknown',
}

export const ACTIVITY_TYPE_LIST = Object.keys(ActivityTypeEnum) as [keyof typeof ActivityTypeEnum];

export const ACTIVITY_QUERY = gql`
  ${ACTIVITY_BASE_FRAGMENT}
  ${LEADERBOARD_INFO_LIST_FRAGMENT}
  ${LEADERBOARD_INFO_ENTRY_LIST_FRAGMENT}

  query GetActivityById($id: ID!) {
    activityList_by_id(id: $id) {
      ...activityBaseFields
      infoList {
        item {
          __typename
          ... on leaderboardEntryInfoList {
            ...leaderboardEntryInfoListFields
          }
          ... on leaderboardInfoList {
            ...leaderboardInfoListFields
          }
        }
      }
    }
  }
`;

export type TQueryActivityInfo = TQueryLeaderboardInfo | TQueryLeaderboardEntryInfo;

export type TQueryCommonActivity<T = TQueryActivityInfo> = TActivityBase & {
  infoList: Array<{
    item: T;
  }>;
};

export type TQueryActivity<T = TQueryActivityInfo> = {
  activityList_by_id: TQueryCommonActivity<T>;
};

export const ACTIVITY_LIST_QUERY = gql`
  ${ACTIVITY_BASE_FRAGMENT}

  query GetActivityList($filter: activityList_filter, $limit: Int) {
    activityList(filter: $filter, limit: $limit, sort: ["-index", "publishTime"]) {
      ...activityBaseFields
    }
  }
`;

export const ACTIVITY_DETAIL_LIST_QUERY = gql`
  ${ACTIVITY_BASE_FRAGMENT}
  ${LEADERBOARD_INFO_LIST_FRAGMENT}
  ${LEADERBOARD_INFO_ENTRY_LIST_FRAGMENT}

  query GetActivityDetailList($filter: activityList_filter, $limit: Int) {
    activityList(filter: $filter, limit: $limit, sort: ["-index", "publishTime"]) {
      ...activityBaseFields
      infoList {
        item {
          __typename
          ... on leaderboardEntryInfoList {
            ...leaderboardEntryInfoListFields
          }
          ... on leaderboardInfoList {
            ...leaderboardInfoListFields
          }
        }
      }
    }
  }
`;
