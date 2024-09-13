import { Layout, Row, Col } from 'antd';
import { IconArrowDown, IconLogo, IconWallet } from 'assets/icons';
import clsx from 'clsx';
import Network from 'components/Network';
import { basicModalView } from 'contexts/useModal/actions';
import { useModalDispatch } from 'contexts/useModal/hooks';
import { memo, useCallback, useMemo, useRef } from 'react';
import LanguageMenu from '../LanguageMenu';
import NavMenu from '../NavMenu';
import { NavLink, useLocation } from 'react-router-dom';
import useSelectedKeys from 'components/Header/hooks/useSelectedKeys';
import { useTranslation } from 'react-i18next';
import { useModal } from 'contexts/useModal';
import CommonButton from 'components/CommonButton';
import useLogin, { useIsConnected } from 'hooks/useLogin';

import './styles.less';
import Font from 'components/Font';
import { useMonitorScroll } from 'hooks/useMonitorScroll';
import useChainId from 'hooks/useChainId';
import { shortenAddress } from 'utils';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import { DepositTipModal, DepositTipModalInterface } from 'Modals/DepositTipModal';
import { useIsDepositPath } from 'hooks/route';

function PcHeader() {
  const { selectedKeys } = useSelectedKeys();
  const { walletInfo, isLocking } = useConnectWallet();
  const isConnected = useIsConnected();
  const { chainId } = useChainId();
  const pathname = useLocation().pathname;
  const { t } = useTranslation();
  const depositTipModalRef = useRef<DepositTipModalInterface>();

  const [modalState] = useModal();
  const modalDispatch = useModalDispatch();
  const { toLogin, toSignup } = useLogin();

  const toggleAccountModal = () => {
    modalDispatch(basicModalView.setAccountModal.actions(!modalState.accountModal));
  };

  useMonitorScroll();

  const isDepositPath = useIsDepositPath();
  const onDepositClick = useCallback(() => {
    depositTipModalRef.current?.show();
  }, []);

  const isOpacity = useMemo(() => {
    return !(
      pathname.includes('/user-center') ||
      selectedKeys[0] === 'overview' ||
      selectedKeys[0] === 'transaction' ||
      selectedKeys[0] === 'unMatched'
    );
  }, [selectedKeys, pathname]);

  const displayAddress = useMemo(() => {
    if (!walletInfo?.address) return '';
    const addr = shortenAddress(walletInfo.address);
    return `ELF_${addr}_${chainId}`;
  }, [chainId, walletInfo]);

  const renderLoginPart = () => {
    if (isConnected) {
      return (
        <Col>
          <CommonButton onClick={toggleAccountModal} className="my-btn">
            <div className="my-btn-content">
              <IconWallet />
              <Font size={14} className="my-btn-content-font">
                {displayAddress}
              </Font>
              <IconArrowDown className="my-btn-content-icon" />
            </div>
          </CommonButton>
        </Col>
      );
    }
    return (
      <>
        <Col>
          <CommonButton
            className="signup-btn"
            style={{ fontWeight: '600' }}
            type={isLocking ? 'primary' : 'text'}
            onClick={toLogin}>
            {t(isLocking ? 'Unlock' : 'Log In')}
          </CommonButton>
        </Col>
        {!isLocking && (
          <Col>
            <CommonButton className="signup-btn" style={{ fontWeight: '600' }} type="primary" onClick={toSignup}>
              {t('Sign Up')}
            </CommonButton>
          </Col>
        )}
      </>
    );
  };

  return (
    <Layout.Header className={clsx('site-header', isOpacity && 'opacity-header')}>
      <Row align="middle" gutter={[20, 0]}>
        <Col>
          <NavLink to={'/'}>
            <IconLogo className="menu-logo" />
          </NavLink>
        </Col>
        <Col flex="1">
          <NavMenu />
        </Col>
        <Col>
          <Row align="middle" gutter={[16, 0]}>
            {!isDepositPath && (
              <Col>
                <CommonButton
                  className="signup-btn"
                  style={{ fontWeight: '600' }}
                  type="primary"
                  onClick={onDepositClick}>
                  {t('deposit')}
                </CommonButton>
              </Col>
            )}
            <Col>
              <Network />
            </Col>
            {renderLoginPart()}
            <Col>
              <LanguageMenu />
            </Col>
          </Row>
        </Col>
      </Row>
      <DepositTipModal ref={depositTipModalRef} />
    </Layout.Header>
  );
}

export default memo(PcHeader);
