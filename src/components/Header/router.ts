import { ReactNode } from 'react';

export type MenuItem = {
  danger?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  key: string;
  title: string;
  path: string;
  onlyMobile?: boolean;
  isHome?: boolean;
};
export const menuList: MenuItem[] = [
  {
    key: 'overview',
    title: 'market',
    path: '/overview',
    isHome: true,
  },
  {
    key: 'trading',
    title: 'trading',
    path: '/trading',
  },
  {
    key: 'swap',
    title: 'Swap',
    path: '/swap',
  },
  {
    key: 'portfolio',
    title: 'Portfolio',
    path: '/portfolio',
  },
];
export const assetList: MenuItem[] = [
  {
    key: 'u-center',
    title: 'overview',
    path: '/',
  },
  {
    key: 'u-exchange',
    title: 'marketMakingAccount',
    path: '/exchange',
  },
  {
    key: 'u-lending',
    title: 'lendingAccount',
    path: '/lending',
  },
];
