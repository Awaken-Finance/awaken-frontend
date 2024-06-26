import NotFound from 'pages/NotFound';
import { Swap } from 'pages/Swap';
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
    path: '/Swap',
    component: Swap,
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
