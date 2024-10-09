import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useMobile } from 'utils/isMobile';
import { menuList as _menuList } from '../router';
import { useActivityEntry } from 'hooks/activity/useActivityEntry';

const useSelectedKeys = () => {
  const isMobile = useMobile();

  const { pathname } = useLocation();

  const activityEntry = useActivityEntry();
  const menuList = useMemo(() => {
    if (!activityEntry) return _menuList;
    return [..._menuList, activityEntry];
  }, [activityEntry]);

  const list = isMobile ? menuList : menuList.filter((item) => !item?.onlyMobile);

  const selectedKeys = useMemo(() => {
    const page = menuList.find((item) => {
      if (item.isHome && pathname === '/') return true;
      return pathname.includes(item.path);
    })?.key;
    return [page || 'unmatched'];
  }, [menuList, pathname]);

  return { selectedKeys, list };
};

export default useSelectedKeys;
