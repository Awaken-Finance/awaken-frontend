import { Menu } from 'antd';
import { MenuInfo } from 'rc-menu/lib/interface';
import { useState, useCallback, memo, useMemo } from 'react';
import { useLanguage } from 'i18n';
import { LOCAL_LANGUAGE } from 'i18n/config';
import CommonButton from 'components/CommonButton';
import { IconCheckPrimary, IconLanguage } from 'assets/icons';
import CommonDropdown from 'components/CommonDropdown';
import './LanguageMenu.less';

function LanguageMenu() {
  const { language, changeLanguage } = useLanguage();
  const [visible, setVisible] = useState(false);

  const onLanguageChange = useCallback(
    (e: MenuInfo) => {
      setVisible(false);
      changeLanguage(e.key);
    },
    [changeLanguage],
  );

  const menu = useMemo(() => {
    return (
      <Menu selectedKeys={[language]} onClick={onLanguageChange}>
        {LOCAL_LANGUAGE.map((item) => {
          return (
            <Menu.Item key={item.language}>
              <span>{item.title}</span>
              {item.language === language && <IconCheckPrimary />}
            </Menu.Item>
          );
        })}
      </Menu>
    );
  }, [language, onLanguageChange]);

  const toggleVisible = useCallback(() => {
    setVisible(!visible);
  }, [visible]);

  return (
    <CommonDropdown
      overlayClassName="language-dropdown-menus"
      placement="bottomRight"
      trigger={['click']}
      visible={visible}
      onVisibleChange={toggleVisible}
      overlay={menu}>
      <CommonButton type="text" icon={<IconLanguage />} onClick={toggleVisible} />
    </CommonDropdown>
  );
}

export default memo(LanguageMenu);
