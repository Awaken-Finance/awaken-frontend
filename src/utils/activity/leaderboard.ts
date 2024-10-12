import { TQueryLeaderboardInfo } from 'graphqlServer/queries/activity/leaderboard';
import { deconstructActivity, ILeaderboardActivity, ILeaderboardEntryActivity } from '.';
import { TQueryCommonActivity, ActivityTypeEnum } from 'graphqlServer/queries/activity';
import { TQueryLeaderboardEntryInfo } from 'graphqlServer/queries/activity/leaderboardEntry';
import { TQueryLeaderboardReward } from 'graphqlServer/queries/activity/leaderboardReward';
import { ZERO } from 'constants/misc';
import BigNumber from 'bignumber.js';

export const formatLeaderboardActivity = (activityDetail: TQueryCommonActivity): ILeaderboardActivity => {
  const detail = deconstructActivity<TQueryLeaderboardInfo>(activityDetail, ActivityTypeEnum.Leaderboard);
  if (!detail) throw new Error('activity error');

  const { info, basicInfo } = detail;
  return {
    ...basicInfo,
    type: info.type,
    info: info,
  };
};

export const formatLeaderboardEntryActivity = (activityDetail: TQueryCommonActivity): ILeaderboardEntryActivity => {
  const detail = deconstructActivity<TQueryLeaderboardEntryInfo>(activityDetail, ActivityTypeEnum.LeaderboardEntry);
  if (!detail) throw new Error('activity error');

  const { info, basicInfo } = detail;
  const { children } = info;
  return {
    ...basicInfo,
    type: info.type,
    info: {
      ...info,
      children: children.map((item) => formatLeaderboardActivity(item.activityList_id)),
    },
  };
};

export const getLeaderboardRewardsMap = (activity: ILeaderboardActivity) => {
  const rewardsMap: Record<string, TQueryLeaderboardReward> = {};
  let lastRanking = 0;
  activity.info.rewardList.forEach(({ leaderboardRewardList_id: item }) => {
    for (let i = 0; i < item.amount; i++) {
      ++lastRanking;
      rewardsMap[lastRanking] = item;
    }
  });
  return rewardsMap;
};

export const getLeaderboardActualRewardsMap = (activity: ILeaderboardActivity, numberOfJoin: number) => {
  const actualRewardsMap: Record<string, number> = {};
  let lastRanking = 0;
  activity.info.rewardList.forEach(({ leaderboardRewardList_id: item }) => {
    const actualAmount = numberOfJoin >= item.amount ? item.amount : Math.max(0, numberOfJoin);
    numberOfJoin -= item.amount;

    let actualRewards = item.reward;
    if (item.isShare) {
      if (actualAmount !== 0) {
        actualRewards = ZERO.plus(item.reward).div(actualAmount).dp(2, BigNumber.ROUND_DOWN).toNumber();

        if (item.maxRewardPerPerson) {
          actualRewards = BigNumber.min(actualRewards, item.maxRewardPerPerson).toNumber();
        }
      } else {
        actualRewards = 0;
      }
    }

    for (let i = 0; i < item.amount; i++) {
      ++lastRanking;
      actualRewardsMap[lastRanking] = actualRewards;
    }
  });

  return actualRewardsMap;
};

export const getPreRewardRanking = (activity: ILeaderboardActivity, nowRanking: number) => {
  const list = activity.info.rewardList;
  let pre = 0;
  for (let i = 0; i < list.length; i++) {
    const { leaderboardRewardList_id: item } = list[i];
    const last = pre + item.amount;
    if (nowRanking <= last) return pre;
    pre = last;
  }
  return pre;
};
