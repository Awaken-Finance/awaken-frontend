import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useMobile } from 'utils/isMobile';
import { MenuItem } from '../router';

const useSelectedKeys = (menuList: MenuItem[]) => {
  const isMobile = useMobile();

  const { pathname } = useLocation();

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
