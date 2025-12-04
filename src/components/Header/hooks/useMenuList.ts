import { menuList as _menuList } from '../router';
import { useActivityEntry } from 'hooks/activity/useActivityEntry';
import { useMemo } from 'react';

export const useMenuList = () => {
  const { menuItem: activityEntry, activity } = useActivityEntry();
  const menuList = useMemo(() => {
    if (!activityEntry) return _menuList;
    return [..._menuList, activityEntry];
  }, [activityEntry]);

  return { activity, menuList };
};
