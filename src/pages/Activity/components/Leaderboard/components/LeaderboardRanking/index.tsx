import { ILeaderboardActivity } from 'utils/activity';
import './styles.less';
import { ActivityStatusEnum } from 'pages/Activity/hooks/common';
import { LeaderboardRankingMine } from '../LeaderboardRankingMine';
import { LeaderboardRankingList } from '../LeaderboardRankingList';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getActivityMyRanking, getActivityRankingList } from 'api/utils/activity';
import { TLeaderboardRankingItem, TLeaderboardRankingMine } from 'types/activity';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import { useLeaderboardWS } from 'hooks/activity/useLeaderboardWS';
import { parseUrl } from 'query-string';
import { useMobile } from 'utils/isMobile';

export type TLeaderboardCountdownProps = {
  activity: ILeaderboardActivity;
  status: ActivityStatusEnum;
};

const INFO_REFRESH_INTERVAL_LIST = [5, 10, 15, 20, 30];

const LIST_OFFSET_TOP = 80;
const LIST_MOBILE_OFFSET_TOP = 20;

export const LeaderboardRanking = ({ activity, status }: TLeaderboardCountdownProps) => {
  const { walletInfo } = useConnectWallet();
  const isMobile = useMobile();

  const [myRankingInfo, setMyRankingInfo] = useState<TLeaderboardRankingMine>();
  const initMyRankingInfo = useCallback(async () => {
    const address = walletInfo?.address;
    if (!address) {
      setMyRankingInfo(undefined);
      return;
    }

    try {
      const result = await getActivityMyRanking({
        activityId: Number(activity.serviceId || 0),
        address,
      });
      setMyRankingInfo(result);
    } catch (error) {
      console.log('initMyRankingInfo error', error);
    }
  }, [activity.serviceId, walletInfo?.address]);
  const initMyRankingInfoRef = useRef(initMyRankingInfo);
  initMyRankingInfoRef.current = initMyRankingInfo;

  useEffect(() => {
    if (!walletInfo?.address) return;

    initMyRankingInfoRef.current();
    let intervalTimer: NodeJS.Timeout;
    const timerList = INFO_REFRESH_INTERVAL_LIST.map((item, idx) =>
      setTimeout(() => {
        initMyRankingInfoRef.current();
        if (INFO_REFRESH_INTERVAL_LIST.length - 1 === idx) {
          intervalTimer = setInterval(() => {
            initMyRankingInfoRef.current();
          }, 1000 * 60);
        }
      }, item * 1000),
    );
    return () => {
      timerList.forEach((item) => {
        item && clearTimeout(item);
      });
      intervalTimer && clearInterval(intervalTimer);
    };
  }, [walletInfo?.address]);

  const [apiList, setApiList] = useState<TLeaderboardRankingItem[]>();
  const [isInit, setIsInit] = useState(false);
  const initRankingList = useCallback(async () => {
    try {
      const result = await getActivityRankingList({
        activityId: Number(activity.serviceId || 0),
      });
      setApiList(result);
    } catch (error) {
      console.log('initRankingList error', error);
    } finally {
      setIsInit(true);
    }
  }, [activity.serviceId]);
  useEffect(() => {
    initRankingList();
  }, [initRankingList]);

  const { list: wsList } = useLeaderboardWS({
    isInit: isInit,
    activityId: activity.serviceId || 0,
  });
  const list = useMemo(() => wsList || apiList || [], [apiList, wsList]);

  const rankingInfoFromList = useMemo(
    () => list.find((item) => item.address === walletInfo?.address),
    [list, walletInfo?.address],
  );
  const rankingInfo = useMemo(() => rankingInfoFromList || myRankingInfo, [myRankingInfo, rankingInfoFromList]);

  const isWsInitRef = useRef(false);
  useEffect(() => {
    if (!wsList) return;
    if (isWsInitRef.current === false) {
      isWsInitRef.current = true;
      return;
    }
    console.log('wsList update');
    initMyRankingInfoRef.current();
  }, [wsList]);

  const isScrolledRef = useRef(false);
  useEffect(() => {
    if (!list?.length || isScrolledRef.current) return;
    isScrolledRef.current = true;

    const url = window.location.href;
    const parsedQuery = parseUrl(url);
    if (parsedQuery?.query?.anchor !== 'list') return;
    setTimeout(() => {
      const element = document.getElementById('leaderboardRankingList');
      if (!element) return;
      const rect = element.getBoundingClientRect();

      const absoluteElementTop = rect.top + window.scrollY - (isMobile ? LIST_MOBILE_OFFSET_TOP : LIST_OFFSET_TOP);

      window.scrollTo({
        top: absoluteElementTop,
        behavior: 'smooth',
      });
    }, 500);
  }, [isMobile, list]);

  if (status === ActivityStatusEnum.Preparation) return <></>;

  return (
    <div className="leaderboard-ranking">
      {rankingInfo && (
        <LeaderboardRankingMine
          className="leaderboard-ranking-mine-section"
          activity={activity}
          status={status}
          list={list}
          info={rankingInfo}
        />
      )}

      {list && !!list.length && <LeaderboardRankingList activity={activity} list={list} />}
    </div>
  );
};
