import { gql } from '@apollo/client';
import { CMS_FILE_FRAGMENT, TCmsFile } from '../index';
import { TCmsTranslations } from 'graphqlServer/types/cms';

export const LEADERBOARD_REWARD_TRANSLATIONS_FRAGMENT = gql`
  fragment leaderboardRewardTranslationsFields on leaderboardRewardList_translations {
    languages_code {
      code
    }
    title
    description
    subDescription
  }
`;

export type TLeaderboardRewardTranslations = {
  title: string;
  description: string;
  subDescription?: string;
};

export const LEADERBOARD_REWARD_List_FRAGMENT = gql`
  ${CMS_FILE_FRAGMENT}
  ${LEADERBOARD_REWARD_TRANSLATIONS_FRAGMENT}

  fragment leaderboardRewardListFields on leaderboardRewardList {
    id
    index
    amount
    reward
    isShare
    maxRewardPerPerson
    icon {
      ...cmsFileFields
    }
    translations {
      ...leaderboardRewardTranslationsFields
    }
  }
`;

export type TQueryLeaderboardReward = {
  id: number;
  index: number;
  amount: number;
  reward: number;
  isShare: boolean;
  maxRewardPerPerson?: number;
  icon?: TCmsFile;
  translations: (TCmsTranslations & TLeaderboardRewardTranslations)[];
};
