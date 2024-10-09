import { gql } from '@apollo/client';
import { ActivityTypeEnum } from './index';
import { CMS_FILE_FRAGMENT, TCmsFile } from '../index';
import { TCmsTranslations } from 'graphqlServer/types/cms';
import { LEADERBOARD_REWARD_List_FRAGMENT, TQueryLeaderboardReward } from './leaderboardReward';

export const LEADERBOARD_INFO_TRANSLATIONS_FRAGMENT = gql`
  fragment leaderboardInfoTranslationsFields on leaderboardInfoList_translations {
    languages_code {
      code
    }
    activityName
    labelTag
    description
    periodTitle
    countDownStartLabel
    countDownEndLabel
    prepareToJoinBtn
    joinBtn
    fulfilledJoinBtn
    expiredJoinBtn
    rewardSectionTitle
    ruleSectionTitle
    ruleContent
    participationSuffix
    prepareToExecuteBtn
    executeBtn
    congratulatoryCopy
    expiredExecuteBtn
    myRankingTitle
    distanceToPrefix
    leaderboardTitle
    rankingLabel
    expectedRewardsLabel
    addressLabel
    totalVolumeLabel
    rankingChangeLabel
    rewardsLabel
  }
`;

export type TLeaderboardInfoTranslations = {
  activityName: string;
  labelTag: string;
  description: string;
  periodTitle: string;
  countDownStartLabel: string;
  countDownEndLabel: string;
  prepareToJoinBtn: string;
  joinBtn: string;
  fulfilledJoinBtn: string;
  expiredJoinBtn: string;
  rewardSectionTitle: string;
  ruleSectionTitle: string;
  ruleContent: string;
  participationSuffix: string;
  prepareToExecuteBtn: string;
  executeBtn: string;
  congratulatoryCopy: string;
  expiredExecuteBtn: string;
  myRankingTitle: string;
  distanceToPrefix: string;
  leaderboardTitle: string;
  rankingLabel: string;
  expectedRewardsLabel: string;
  addressLabel: string;
  totalVolumeLabel: string;
  rankingChangeLabel: string;
  rewardsLabel: string;
};

export const LEADERBOARD_INFO_LIST_FRAGMENT = gql`
  ${LEADERBOARD_INFO_TRANSLATIONS_FRAGMENT}
  ${CMS_FILE_FRAGMENT}
  ${LEADERBOARD_REWARD_List_FRAGMENT}

  fragment leaderboardInfoListFields on leaderboardInfoList {
    type
    pointUnit
    signPlainText
    executeBtnLink
    mainImage {
      ...cmsFileFields
    }
    backgroundImage {
      ...cmsFileFields
    }
    decorativeImage {
      ...cmsFileFields
    }
    rewardList(sort: ["-leaderboardRewardList_id.index"]) {
      leaderboardRewardList_id {
        ...leaderboardRewardListFields
      }
    }
    translations {
      ...leaderboardInfoTranslationsFields
    }
  }
`;

export type TQueryLeaderboardInfo = {
  type: ActivityTypeEnum.Leaderboard;
  mainImage: TCmsFile;
  backgroundImage?: TCmsFile;
  decorativeImage?: TCmsFile;
  pointUnit?: string;
  signPlainText: string;
  executeBtnLink: string;
  rewardList: Array<{
    leaderboardRewardList_id: TQueryLeaderboardReward;
  }>;
  translations: (TCmsTranslations & TLeaderboardInfoTranslations)[];
};
