import { ReactNode } from 'react';

export type MenuItem = {
  danger?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  key: string;
  title: string;
  path: string;
  onlyMobile?: boolean;
};
export const menuList: MenuItem[] = [
  {
    key: 'trading',
    title: 'trading',
    path: '/trading',
  },
  {
    key: 'overview',
    title: 'market',
    path: '/overview',
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
