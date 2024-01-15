import { lazy } from 'react';
import { RoutesProps } from 'types';
// import { asset, exchange } from 'assets/images';
const Home = lazy(() => import('./components/AssetOverview'));
const AssetExchange = lazy(() => import('./components/AssetExchange'));
const RecentTransaction = lazy(() => import('./components/RecentTransaction'));

interface RouteMapProps extends RoutesProps {
  menuItem?: string;
  icon?: any;
}
export const routeMap: RouteMapProps[] = [
  {
    path: '/',
    exact: true,
    menuItem: 'My Assets',
    component: Home,
    // icon: asset,
  },
  {
    path: '/exchange',
    exact: true,
    component: AssetExchange,
    // icon: exchange,
    menuItem: 'myMarketingMakingLiquidity',
  },
  {
    path: '/transaction',
    exact: true,
    component: RecentTransaction,
    // icon: exchange,
    menuItem: 'recentTransaction',
  },
  // {
  //   path: '/lending',
  //   exact: true,
  //   component: Lending,
  //   icon: lending,
  //   menuItem: 'lendingAccount',
  // },
  // {
  //   path: '/farm',
  //   exact: true,
  //   component: AssetFarm,
  //   icon: farm,
  //   menuItem: 'farmingAccount',
  // },
  // {
  //   path: '/dividend',
  //   exact: true,
  //   component: Dividend,
  //   icon: dividend,
  //   menuItem: 'dividendPoolAccount',
  // },
];

interface PathMapInterface {
  [x: string]: {
    text: string;
    path: string;
  };
}
export const PathMap: PathMapInterface = {
  // exchange: {
  //   text: 'marketMakingRecord',
  //   path: '/exchange',
  // },
};

export type PathMapType = keyof typeof PathMap;
