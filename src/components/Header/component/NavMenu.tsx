import { Menu } from 'antd';
import { MenuClickEventHandler } from 'rc-menu/lib/interface';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { useMobile } from 'utils/isMobile';
import useSelectedKeys from '../hooks/useSelectedKeys';

function NavMenu({ onPageChange }: { onPageChange?: MenuClickEventHandler }) {
  const { t } = useTranslation();
  const isMobile = useMobile();

  const { selectedKeys, list } = useSelectedKeys();

  return (
    <Menu
      className="header-nav"
      style={{ height: isMobile ? 'auto' : '60px', backgroundColor: 'transparent', lineHeight: '60px' }}
      mode={isMobile ? 'inline' : 'horizontal'}
      onClick={onPageChange}
      selectedKeys={selectedKeys}>
      {list.map((item) => {
        return (
          <Menu.Item key={item.key}>
            <NavLink to={item.path}>{t(item.title)}</NavLink>
            {/* {isMobile && <IconArrowRight />} */}
          </Menu.Item>
        );
      })}
    </Menu>
  );
}

export default memo(NavMenu);
