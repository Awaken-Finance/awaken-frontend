import { Button, Dropdown, Menu } from 'antd';
import clsx from 'clsx';
import { basicModalView } from 'contexts/useModal/actions';
import { useModalDispatch } from 'contexts/useModal/hooks';
import { useActiveWeb3React } from 'hooks/web3';
import { MenuClickEventHandler } from 'rc-menu/lib/interface';
import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import useSelectedKeys from '../hooks/useSelectedKeys';
import { assetList } from '../router';

function OverlayMenu({ onPageChange }: { onPageChange: MenuClickEventHandler }) {
  const { t } = useTranslation();
  const { selectedKeys } = useSelectedKeys();
  const { account } = useActiveWeb3React();
  const modalDispatch = useModalDispatch();
  return (
    <Menu selectedKeys={selectedKeys} onClick={onPageChange}>
      {assetList.map((item) => {
        return (
          <Menu.Item key={item.key}>
            <NavLink
              onClick={() => {
                if (!account) modalDispatch(basicModalView.setWalletModal.actions(true));
              }}
              to={!account ? '#' : `/user-center${item.path}`}>
              {t(item.title)}
            </NavLink>
          </Menu.Item>
        );
      })}
    </Menu>
  );
}

function AssetsMenu({ className }: { className: string }) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  const onPageChange = useCallback(() => {
    setVisible(false);
  }, []);

  const toggleVisible = useCallback(() => {
    setVisible(!visible);
  }, [visible]);

  return (
    <Dropdown
      trigger={['click']}
      className={clsx(className, 'btn')}
      overlayClassName={clsx(className, 'menu')}
      onVisibleChange={toggleVisible}
      placement="bottomCenter"
      visible={visible}
      overlay={<OverlayMenu onPageChange={onPageChange} />}>
      <Button onClick={toggleVisible}>{t('asset')}</Button>
    </Dropdown>
  );
}

export default memo(AssetsMenu);
