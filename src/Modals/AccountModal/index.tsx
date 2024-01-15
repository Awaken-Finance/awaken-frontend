import { useModal } from 'contexts/useModal';
import { basicModalView } from 'contexts/useModal/actions';
import { useMobile } from 'utils/isMobile';
import {
  SwitchWalletType,
  WebLoginEvents,
  openNightElfPluginPage,
  openPortkeyPluginPage,
  useMultiWallets,
  useWebLogin,
  useWebLoginEvent,
} from 'aelf-web-login';
import { Row, Carousel, Modal, Col, message } from 'antd';
import { useMemo, useRef, useState } from 'react';
import { CarouselRef } from 'antd/lib/carousel';
import AccountInfo from './AccountInfo';
import CommonButton from 'components/CommonButton';
import SwitchWallets from './SwitchWallets';
import Font from 'components/Font';
import { IconArrowDown, IconArrowUp, IconClose } from 'assets/icons';
import { TableEmptyData } from 'assets/images';
import MyTokenList from './MyTokenList';
import { matchPath, useHistory } from 'react-router-dom';
import useUserAssetTokenList from 'hooks/useUserAssetTokenList';
import { detectDiscoverProvider, detectNightElf } from 'aelf-web-login';
import { useTranslation } from 'react-i18next';
import { routes } from 'routes';
import querystring from 'query-string';

import './styles.less';

function AccountModal() {
  const [{ accountModal }, { dispatch }] = useModal();
  const [showHiddenTokens, setShowHiddenTokens] = useState(false);
  const {
    walletType,
    logout,
    wallet: { address },
  } = useWebLogin();
  const history = useHistory();
  const query = useMemo(() => querystring.parse(history.location.search), [history.location.search]);
  const redirect = query['redirect'];
  const [logoutPortkeyBySwitch, setLogoutPortkeyBySwitch] = useState(false);
  const [checkingPlugin, setCheckingPlugin] = useState(false);
  const { current, switchWallet, switching } = useMultiWallets();
  const corousel = useRef<CarouselRef>(null);
  const isMobile = useMobile();
  const { list: userTokenList } = useUserAssetTokenList(accountModal);
  const isEmpty = userTokenList.showList.length + userTokenList.hiddenList.length === 0;
  const isSwitchingWallet = useMemo(() => checkingPlugin && switching, [checkingPlugin, switching]);
  const { t } = useTranslation();

  const toWalletInfo = () => {
    corousel.current?.goTo(0);
  };
  const toSwitchWallet = () => {
    corousel.current?.goTo(1);
  };

  const onClose = () => {
    dispatch(basicModalView.setAccountModal.actions(false));
    corousel.current?.goTo(0, true);
  };

  const onClickSwitchWallet = async (type: SwitchWalletType) => {
    if (current === type) return;
    if (isSwitchingWallet) return;

    setCheckingPlugin(true);
    setLogoutPortkeyBySwitch(false);

    if (type === 'discover') {
      try {
        const discoverProvider = await detectDiscoverProvider();
        if (!discoverProvider && !isMobile) {
          setCheckingPlugin(false);
          openPortkeyPluginPage();
          return;
        }
      } catch (e) {
        setCheckingPlugin(false);
        if (!isMobile) {
          openPortkeyPluginPage();
        }
        return;
      }
    }

    if (type === 'elf') {
      const detectRes = await detectNightElf();
      if (detectRes === 'none' && !isMobile) {
        openNightElfPluginPage();
        setCheckingPlugin(false);
        return;
      }
    }
    setCheckingPlugin(false);

    if (current === 'portkey') {
      setLogoutPortkeyBySwitch(true);
      await logout();
      return;
    }

    if (type === 'portkey') {
      await logout();
      window.location.href = '/login';
    } else {
      console.log('switch to', type);
      try {
        await switchWallet(type);
        console.log('switch to', type, 'done');
      } catch (err: any) {
        message.error(err.message);
      }
    }
  };

  const onClickLogout = async () => {
    if (walletType === 'portkey') {
      dispatch(basicModalView.setAccountModal.actions(false));
      await logout();
      return;
    }
    setLogoutPortkeyBySwitch(false);
    dispatch(basicModalView.setAccountModal.actions(false));
    await logout();
  };

  useWebLoginEvent(WebLoginEvents.LOGOUT, () => {
    console.log('logout', current);
    setLogoutPortkeyBySwitch(false);
    onClose();
    if (logoutPortkeyBySwitch) {
      window.location.href = '/login';
    } else {
      const isNeedLoginPage = routes.some((route) => {
        if (route.path === history.location.pathname || matchPath(history.location.pathname, { path: route.path })) {
          return !!route.authComp;
        }
        return false;
      });
      if (isNeedLoginPage) {
        window.location.href = '/';
      } else {
        const noReloadPages = ['/user-center'];
        const noReload = typeof redirect === 'string' && !!noReloadPages.find((path) => redirect.startsWith(path));
        if (!noReload) {
          // window.location.reload();
        }
      }
    }
  });

  const renderEmpty = () => {
    return (
      <div className="my-token-list-empty">
        <img src={TableEmptyData} alt="" />
        <Font size={14} color="one" weight="bold">
          {t('NoTokens')}
        </Font>
        <Font size={14} color="two" weight="regular">
          {t('NoTokensDesc')}
        </Font>
      </div>
    );
  };

  const renderHidden = () => {
    return (
      <>
        <Row className="my-tokens-split">
          <Col flex={1}>
            <Font size={14} weight="bold">
              {`${t('Hidden')} (${userTokenList.hiddenList.length})`}
            </Font>
          </Col>
          <Col>
            <CommonButton className="my-tokens-hidden-btn" onClick={() => setShowHiddenTokens(!showHiddenTokens)}>
              <span>{showHiddenTokens ? t('Hide') : t('Show')}</span>
              {showHiddenTokens ? <IconArrowUp /> : <IconArrowDown />}
            </CommonButton>
          </Col>
        </Row>
        {showHiddenTokens && (
          <Row>
            <MyTokenList items={userTokenList.hiddenList} address={address} />
          </Row>
        )}
      </>
    );
  };

  const renderTokenList = () => {
    return (
      <>
        <Row>
          <MyTokenList items={userTokenList.showList} address={address} />
        </Row>
        {userTokenList.hiddenList.length > 0 && renderHidden()}
      </>
    );
  };

  return (
    <Modal
      // destroyOnClose
      className="account-modal"
      visible={accountModal}
      closable={isMobile}
      closeIcon={<IconClose />}
      width={isMobile ? '100%' : '420px'}
      title={isMobile ? ' ' : null}
      mask={false}
      footer={null}
      style={isMobile ? {} : { position: 'fixed', top: 68, right: 8 }}
      onCancel={onClose}>
      <Carousel ref={corousel} dots={false} autoplay={false} swipe={false}>
        <div className="account-content">
          <AccountInfo onClickLogout={onClickLogout} />
          {!isMobile && (
            <CommonButton className="switch-wallet-btn" type="ghost" onClick={toSwitchWallet}>
              {t('SwitchWallet')}
            </CommonButton>
          )}
          <Row style={{ marginTop: isMobile ? '20px' : 0 }}>
            <Font size={16} weight="medium">
              {t('tokens')}
            </Font>
          </Row>
          {isEmpty ? renderEmpty() : renderTokenList()}
        </div>
        <div className="account-switch">
          <SwitchWallets onClickBack={toWalletInfo} onSwitchWallet={onClickSwitchWallet} />
        </div>
      </Carousel>
    </Modal>
  );
}

export default AccountModal;
