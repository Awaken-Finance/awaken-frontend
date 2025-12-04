import { useMobile } from 'utils/isMobile';
import MobileHeader from './component/MobileHeader';
import PcHeader from './component/PcHeader';
import { useMenuList } from './hooks/useMenuList';

export default function Header() {
  const isMobile = useMobile();
  const { activity, menuList } = useMenuList();

  return isMobile ? (
    <MobileHeader menuList={menuList} activity={activity} />
  ) : (
    <PcHeader menuList={menuList} activity={activity} />
  );
}
