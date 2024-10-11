import { gql } from '@apollo/client';
import { ActivityTypeEnum, TQueryCommonActivity } from './index';
import { LEADERBOARD_INFO_LIST_FRAGMENT, TQueryLeaderboardInfo } from './leaderboard';
import { CMS_FILE_FRAGMENT, TCmsFile } from '../index';
import { ACTIVITY_BASE_FRAGMENT } from './common';
import { TCmsTranslations } from 'graphqlServer/types/cms';

export const LEADERBOARD_ENTRY_INFO_TRANSLATIONS_FRAGMENT = gql`
  fragment leaderboardEntryInfoTranslationsFields on leaderboardEntryInfoList_translations {
    languages_code {
      code
    }
    labelTag
    title
    description
  }
`;

export type TLeaderboardEntryInfoTranslations = {
  labelTag: string;
  title: string;
  description: string;
};

export const LEADERBOARD_INFO_ENTRY_LIST_FRAGMENT = gql`
  ${ACTIVITY_BASE_FRAGMENT}
  ${CMS_FILE_FRAGMENT}
  ${LEADERBOARD_INFO_LIST_FRAGMENT}
  ${LEADERBOARD_ENTRY_INFO_TRANSLATIONS_FRAGMENT}

  fragment leaderboardEntryInfoListFields on leaderboardEntryInfoList {
    type
    backgroundColor
    mainImage {
      ...cmsFileFields
    }
    backgroundImage {
      ...cmsFileFields
    }
    decorativeImage {
      ...cmsFileFields
    }
    translations {
      ...leaderboardEntryInfoTranslationsFields
    }
    children(sort: ["-activityList_id.index"]) {
      activityList_id {
        ...activityBaseFields
        infoList {
          item {
            __typename
            ... on leaderboardInfoList {
              ...leaderboardInfoListFields
            }
          }
        }
      }
    }
  }
`;

export type TQueryLeaderboardEntryInfo = {
  type: ActivityTypeEnum.LeaderboardEntry;
  mainImage: TCmsFile;
  backgroundColor: string;
  backgroundImage?: TCmsFile;
  decorativeImage?: TCmsFile;
  translations: (TCmsTranslations & TLeaderboardEntryInfoTranslations)[];
  children: Array<{
    activityList_id: TQueryCommonActivity<TQueryLeaderboardInfo>;
  }>;
};
