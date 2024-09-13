import NotFound from 'pages/NotFound';

import { lazy } from 'react';
import { RoutesProps } from 'types';
import { sleep } from 'utils';

const Overview = lazy(() => import('pages/Overview'));
const Exchange = lazy(() => import('pages/Exchange'));
const CreatePair = lazy(() => import('pages/CreatePair'));
const ManageLiquidity = lazy(() => import('pages/Liquidity'));
const AuthComp = lazy(() =>
  import('components/AuthComp').then(async (v) => {
    await sleep(1000);
    return v;
  }),
);

const UserCenter = lazy(() => import('pages/UserCenter'));
const Login = lazy(() => import('pages/Login'));
const Example = lazy(() => import('pages/Example'));
const Swap = lazy(() => import('pages/Swap'));
const Portfolio = lazy(() => import('pages/Portfolio'));
const Transactions = lazy(() => import('pages/Transactions'));
const Deposit = lazy(() => import('pages/Deposit'));
const DepositHistory = lazy(() => import('pages/DepositHistory'));

const routes: RoutesProps[] = [
  {
    path: '/not-found',
    component: NotFound,
  },
  {
    path: '/overview',
    exact: true,
    component: Overview,
  },
  {
    path: '/user-center',
    component: UserCenter,
    authComp: AuthComp,
  },
  {
    path: '/login',
    component: Login,
  },
  {
    path: '/signup',
    component: Login,
  },
  {
    path: '/create-pair',
    component: CreatePair,
    authComp: AuthComp,
  },
  {
    path: '/create-pair/:pair',
    component: CreatePair,
    authComp: AuthComp,
  },
  {
    path: '/liquidity/:pair/add',
    component: ManageLiquidity,
    authComp: AuthComp,
  },
  {
    path: '/liquidity/:pair/remove',
    component: ManageLiquidity,
    authComp: AuthComp,
  },
  {
    path: '/trading/:pair?',
    component: Exchange,
  },
  {
    path: '/swap',
    component: Swap,
  },
  {
    path: '/swap/:tab',
    component: Swap,
  },
  {
    path: '/portfolio',
    component: Portfolio,
    authComp: AuthComp,
  },
  {
    path: '/transactions',
    component: Transactions,
    authComp: AuthComp,
  },
  {
    path: '/transactions/:menu',
    component: Transactions,
    authComp: AuthComp,
  },
  {
    path: '/deposit',
    component: Deposit,
    authComp: AuthComp,
  },
  {
    path: '/withdraw',
    component: Deposit,
    authComp: AuthComp,
  },
  {
    path: '/deposit-history',
    component: DepositHistory,
    authComp: AuthComp,
  },
  {
    path: '/',
    component: Overview,
  },
];

const NODE_ENV = process.env.NODE_ENV;
if (NODE_ENV !== 'production')
  routes.unshift({
    path: '/example',
    exact: true,

    component: Example,
  });

export { routes };
