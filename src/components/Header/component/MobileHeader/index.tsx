import { Layout, Menu } from 'antd';
import { IconLogo } from 'assets/icons';
import Network from 'components/Network';
import { basicModalView } from 'contexts/useModal/actions';
import { useModalDispatch } from 'contexts/useModal/hooks';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import NavMenu from '../NavMenu';
import { LOCAL_LANGUAGE } from 'i18n/config';
import { useLanguage } from 'i18n';
import { useTranslation } from 'react-i18next';
import CommonButton from 'components/CommonButton';
import { IconCheckPrimary, IconClose, IconMenu, IconUser } from 'assets/icons';
import { useModal } from 'contexts/useModal';
import { useHistory, useLocation } from 'react-router-dom';
import useLogin, { useIsConnected } from 'hooks/useLogin';
import clsx from 'clsx';
import CommonModal from 'components/CommonModal';

import './styles.less';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import { DepositTipModal, DepositTipModalInterface } from 'Modals/DepositTipModal';
import { useIsDepositPath } from 'hooks/route';

function MobileHeader() {
  const { t } = useTranslation();
  const history = useHistory();
  const location = useLocation();
  const { isLocking } = useConnectWallet();
  const isConnected = useIsConnected();
  const { language, changeLanguage } = useLanguage();
  const [openKeyList, setOpenKeyList] = useState(['']);
  const [visible, setVisible] = useState(false);
  const { toLogin, toSignup } = useLogin();

  const [modalState] = useModal();
  const modalDispatch = useModalDispatch();

  const toggleAccountModal = () => {
    modalDispatch(basicModalView.setAccountModal.actions(!modalState.accountModal));
  };

  const onClose = useCallback(() => {
    setVisible(false);
    setOpenKeyList(['']);
  }, []);
  const onChangeVisible = useCallback(() => {
    setVisible(!visible);
    setOpenKeyList(['']);
  }, [visible]);

  const onLanguageChange = useCallback(
    (e: any) => {
      changeLanguage(e.key);
    },
    [changeLanguage],
  );

  const renderLoginPart = () => {
    if (isConnected) {
      return (
        <>
          {/* <CommonButton type="text" icon={<IconAssets />} onClick={() => history.push('/user-center/exchange')} /> */}
          <CommonButton type="text" icon={<IconUser />} onClick={toggleAccountModal} />
        </>
      );
    }
    return (
      <>
        <CommonButton className="signup-btn" type="primary" style={{ fontWeight: '600' }} onClick={toLogin}>
          {t(isLocking ? 'Unlock' : 'Log In')}
        </CommonButton>
        {/* <CommonButton className="signup-btn" type="primary" onClick={toSignup}>
          {t('Sign Up')}
        </CommonButton> */}
      </>
    );
  };

  useEffect(
    () => {
      if (visible) {
        setVisible(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [location.pathname],
  );

  const isDepositPath = useIsDepositPath();
  const depositTipModalRef = useRef<DepositTipModalInterface>();
  const onDepositClick = useCallback(() => {
    if (isDepositPath) return;
    depositTipModalRef.current?.show();
  }, [isDepositPath]);

  return (
    <>
      <Layout.Header className="site-header-mobile">
        <IconLogo className="mobile-logo" onClick={() => history.push('/')} />
        <div
          className={clsx({
            'header-right': true,
            'header-right-logined': isConnected,
          })}>
          {isConnected && (
            <CommonButton
              className={clsx(['signup-btn', isDepositPath && 'deposit-menu-disable'])}
              type="ghost"
              style={{ fontWeight: '600' }}
              onClick={onDepositClick}>
              {t('deposit')}
            </CommonButton>
          )}
          <Network overlayClassName="network-wrap-mobile" />
          {renderLoginPart()}
          <CommonButton type="text" icon={<IconMenu />} onClick={onChangeVisible} />
        </div>
      </Layout.Header>
      <DepositTipModal ref={depositTipModalRef} />
      <CommonModal
        showType="drawer"
        title={null}
        mask
        className="site-header-mobile-drawer"
        // contentWrapperStyle={{ width: '100%', height: '100%' }}
        placement="right"
        closable={false}
        onClose={onClose}
        visible={visible}
        getContainer={false}
        width={'100%'}
        height={'100%'}
        zIndex={2000}>
        <div className="header">
          <CommonButton className="close-icon-btn" type="text" icon={<IconClose />} onClick={onClose} />
        </div>
        {!isConnected && !isLocking && (
          <div className="login-buttons">
            <CommonButton
              className="login-btn"
              type={isLocking ? 'primary' : 'default'}
              onClick={() => {
                onClose();
                toLogin();
              }}>
              {t(isLocking ? 'Unlock' : 'Log In')}
            </CommonButton>
            {!isLocking && (
              <CommonButton
                className="signup-btn"
                type="primary"
                onClick={() => {
                  onClose();
                  toSignup();
                }}>
                {t('Sign Up')}
              </CommonButton>
            )}
          </div>
        )}
        <NavMenu onPageChange={onClose} />
        <Menu className="language-nav" style={{ height: 'auto', backgroundColor: 'transparent' }} mode="inline">
          <Menu.Item key={'language'}>{t('language')}</Menu.Item>
        </Menu>
        <Menu
          className="language-nav-submenus"
          selectedKeys={[language]}
          openKeys={openKeyList}
          mode="inline"
          onClick={onLanguageChange}>
          {LOCAL_LANGUAGE.map((item) => {
            return (
              <Menu.Item key={item.language}>
                <span>{item.title}</span>
                {item.language === language && <IconCheckPrimary />}
              </Menu.Item>
            );
          })}
        </Menu>
      </CommonModal>
    </>
  );
}
export default memo(MobileHeader);
