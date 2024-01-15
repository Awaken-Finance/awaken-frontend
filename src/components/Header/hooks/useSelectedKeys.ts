import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useMobile } from 'utils/isMobile';
import { menuList } from '../router';

const useSelectedKeys = () => {
  const isMobile = useMobile();

  const { pathname } = useLocation();
  const list = isMobile ? menuList : menuList.filter((item) => !item?.onlyMobile);

  const selectedKeys = useMemo(() => {
    const page = menuList.find((item) => {
      // if (item.path === '/') {
      //   if (pathname.startsWith('/trading')) {
      //     return true;
      //   }
      //   return pathname === '/';
      // }
      return pathname.includes(item.path);
    })?.key;
    return [page || 'unmatched'];
  }, [pathname]);

  return { selectedKeys, list };
};

export default useSelectedKeys;
