import { ILeaderboardActivity } from 'utils/activity';
import './styles.less';
import { TLeaderboardInfoTranslations } from 'graphqlServer/queries/activity/leaderboard';
import { useCmsTranslations } from 'hooks/cms';
import { LeaderboardMedalBox } from '../LeaderboardMedalBox';
import { LeaderboardSection } from 'pages/Activity/components/LeaderboardEntry/components/LeaderboardSection';
import { CommonTable } from 'components/CommonTable';
import { useMemo } from 'react';
import { ColumnsType } from 'antd/es/table';
import CommonCopy from 'components/CommonCopy';
import { TLeaderboardRankingItem } from 'types/activity';
import { shortenAddress } from 'utils';
import { IconArrowDown3, IconArrowUp2, IconNew } from 'assets/icons';
import { getLeaderboardActualRewardsMap, getLeaderboardRewardsMap } from 'utils/activity/leaderboard';
import { formatPriceUSD } from 'utils/price';
import { formatDefaultAddress } from 'utils/format';
import { ZERO } from 'constants/misc';

export type TLeaderboardRankingListProps = {
  activity: ILeaderboardActivity;
  list: TLeaderboardRankingItem[];
};

export const LeaderboardRankingList = ({ activity, list }: TLeaderboardRankingListProps) => {
  const t = useCmsTranslations<TLeaderboardInfoTranslations>(activity.info.translations);
  const rewardsMap = useMemo(() => getLeaderboardRewardsMap(activity), [activity]);

  const actualRewardsMap = useMemo(
    () => getLeaderboardActualRewardsMap(activity, list.length),
    [activity, list.length],
  );

  const columns = useMemo<ColumnsType<TLeaderboardRankingItem>>(
    () => [
      {
        title: t('rankingLabel'),
        width: 136,
        key: 'ranking',
        dataIndex: 'ranking',
        render: (val: number) => <div>{val}</div>,
      },
      {
        title: t('expectedRewardsLabel'),
        width: 325,
        key: 'expectedRewards',
        dataIndex: 'ranking',
        render: (ranking: number) => {
          const rewardInfo = rewardsMap[ranking];
          if (!rewardInfo) return <div>-</div>;

          if (!rewardInfo.isShare) return <div>{`$${rewardInfo.reward}`}</div>;

          return <div>{`${t('expectRewardsPrefix') || ''}$${actualRewardsMap[ranking]}`}</div>;
        },
      },
      {
        title: t('addressLabel'),
        width: 325,
        key: 'address',
        dataIndex: 'address',
        render: (val: string) => (
          <div className="leaderboard-ranking-list-item-address">
            {shortenAddress(formatDefaultAddress(val), 8)}
            <CommonCopy copyInfo="" copyValue={val} className="copy-address" />
          </div>
        ),
      },
      {
        title: t('totalVolumeLabel'),
        width: 325,
        key: 'totalVolume',
        dataIndex: 'totalPoint',
        render: (val: number) => {
          if (ZERO.plus(val).lt(0.01)) {
            return <div>{`<${activity.info.pointPrefix || ''}0.01${activity.info.pointUnit || ''}`}</div>;
          }

          return (
            <div>{`${activity.info.pointPrefix || ''}${formatPriceUSD(val)}${activity.info.pointUnit || ''}`}</div>
          );
        },
      },
      {
        title: t('rankingChangeLabel'),
        width: 184,
        key: 'rankingChange',
        dataIndex: 'rankingChange1H',
        render: (val: number, item: TLeaderboardRankingItem) => {
          const isNew = !!item.newStatus;
          if (isNew) return <IconNew />;
          const isChange = item.rankingChange1H !== 0;
          const isUp = item.rankingChange1H >= 0;
          const _val = Math.abs(val);

          return (
            <div className="leaderboard-ranking-list-item-change">
              {isChange && (isUp ? <IconArrowUp2 /> : <IconArrowDown3 />)}
              {isChange ? _val : '-'}
            </div>
          );
        },
      },
    ],
    [activity.info.pointPrefix, activity.info.pointUnit, actualRewardsMap, rewardsMap, t],
  );

  const dataSource = useMemo(() => list.slice(3), [list]);
  const medalInfoList = useMemo(
    () =>
      list.slice(0, 3).map((item) => ({
        address: shortenAddress(formatDefaultAddress(item.address || ''), 8),
        volume: `${activity.info.pointPrefix || ''}${formatPriceUSD(item.totalPoint)}${activity.info.pointUnit || ''}`,
        rewards: (() => {
          const rewardInfo = rewardsMap[item.ranking];
          if (!rewardInfo) return '-';
          if (!rewardInfo.isShare) return `$${rewardInfo.reward}`;
          return `${t('expectRewardsPrefix') || ''}$${actualRewardsMap[item.ranking]}`;
        })(),
      })),
    [activity.info.pointPrefix, activity.info.pointUnit, actualRewardsMap, list, rewardsMap, t],
  );

  return (
    <LeaderboardSection className="leaderboard-ranking-list" id="leaderboardRankingList">
      <div className="leaderboard-ranking-list-title">{t('leaderboardTitle')}</div>
      <div className="leaderboard-ranking-list-title-header">
        <LeaderboardMedalBox activity={activity} type={2} {...(medalInfoList[1] || {})} />
        <LeaderboardMedalBox activity={activity} type={1} {...(medalInfoList[0] || {})} />
        <LeaderboardMedalBox activity={activity} type={3} {...(medalInfoList[2] || {})} />
      </div>

      {dataSource.length && (
        <div className="leaderboard-ranking-list-content">
          <CommonTable
            total={47}
            loading={false}
            dataSource={dataSource}
            columns={columns}
            rowKey={(record: { address: string }) => record?.address}
            pageSize={1000}
            pageNum={1}
            emptyType="nodata"
          />
        </div>
      )}
    </LeaderboardSection>
  );
};
