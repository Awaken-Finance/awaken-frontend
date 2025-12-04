import { Layout, Row, Col } from 'antd';
import { IconArrowDown, IconLogo, IconWallet } from 'assets/icons';
import clsx from 'clsx';
import Network from 'components/Network';
import { basicModalView } from 'contexts/useModal/actions';
import { useModalDispatch } from 'contexts/useModal/hooks';
import { useCallback, useMemo, useRef } from 'react';
import LanguageMenu from '../LanguageMenu';
import NavMenu from '../NavMenu';
import { NavLink } from 'react-router-dom';
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
import { MenuItem } from 'components/Header/router';
import { TActivityBase } from 'graphqlServer/queries/activity/common';
import { ActivityNotice } from '../ActivityNotice';

export type TPcHeaderProps = {
  menuList: MenuItem[];
  activity?: TActivityBase;
};

function PcHeader({ menuList, activity }: TPcHeaderProps) {
  const { walletInfo } = useConnectWallet();
  const isConnected = useIsConnected();
  const { chainId } = useChainId();
  const { t } = useTranslation();
  const depositTipModalRef = useRef<DepositTipModalInterface>();

  const [modalState] = useModal();
  const modalDispatch = useModalDispatch();
  const { toLogin } = useLogin();

  const toggleAccountModal = () => {
    modalDispatch(basicModalView.setAccountModal.actions(!modalState.accountModal));
  };

  useMonitorScroll();

  const isDepositPath = useIsDepositPath();
  const onDepositClick = useCallback(() => {
    if (isDepositPath) return;
    depositTipModalRef.current?.show();
  }, [isDepositPath]);

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
      <Col>
        <CommonButton className="signup-btn" style={{ fontWeight: '600' }} type="primary" onClick={toLogin}>
          {t('Log In')}
        </CommonButton>
      </Col>
    );
  };

  return (
    <Layout.Header className={clsx('site-header', 'activity-site-header')}>
      <ActivityNotice activity={activity} />
      <Row className="site-header-content" align="middle">
        <Col>
          <NavLink to={'/'}>
            <IconLogo className="menu-logo" />
          </NavLink>
        </Col>
        <Col className="site-header-menu-list" flex="1">
          <NavMenu menuList={menuList} />
        </Col>
        <Col>
          <Row align="middle" gutter={[16, 0]}>
            {isConnected && (
              <Col>
                <CommonButton
                  className={clsx(['signup-btn', isDepositPath && 'deposit-menu-disable'])}
                  style={{ fontWeight: '600' }}
                  type="ghost"
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

export default PcHeader;
