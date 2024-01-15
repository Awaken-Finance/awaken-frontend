import { Layout, Row, Col } from 'antd';
import { IconLogo } from 'assets/icons';
import clsx from 'clsx';
import Network from 'components/Network';
import { basicModalView } from 'contexts/useModal/actions';
import { useModalDispatch } from 'contexts/useModal/hooks';
import { memo, useMemo } from 'react';
import LanguageMenu from '../LanguageMenu';
import NavMenu from '../NavMenu';
import { NavLink, useHistory, useLocation } from 'react-router-dom';
import useSelectedKeys from 'components/Header/hooks/useSelectedKeys';
import { useTranslation } from 'react-i18next';
import { WebLoginState, useWebLogin } from 'aelf-web-login';
import { useModal } from 'contexts/useModal';
import CommonButton from 'components/CommonButton';
import { IconUser } from 'assets/icons';
import useLogin from 'hooks/useLogin';

import './styles.less';

function PcHeader() {
  const { selectedKeys, list } = useSelectedKeys();
  const { loginState } = useWebLogin();
  const pathname = useLocation().pathname;
  const { t } = useTranslation();
  const history = useHistory();
  const [modalState] = useModal();
  const modalDispatch = useModalDispatch();
  const { toLogin, toSignup } = useLogin();

  const toggleAccountModal = () => {
    modalDispatch(basicModalView.setAccountModal.actions(!modalState.accountModal));
  };

  const isOpacity = useMemo(() => {
    return !(
      pathname.includes('/user-center') ||
      selectedKeys[0] === 'overview' ||
      selectedKeys[0] === 'transaction' ||
      selectedKeys[0] === 'unMatched'
    );
  }, [selectedKeys, pathname]);

  const renderLoginPart = () => {
    if (loginState === WebLoginState.logined) {
      return (
        <>
          <CommonButton
            type="text"
            style={{ fontSize: 16, fontWeight: '600' }}
            onClick={() => history.push('/user-center')}>
            {t('Assets')}
          </CommonButton>
          <CommonButton type="text" icon={<IconUser />} onClick={toggleAccountModal} />
        </>
      );
    }
    return (
      <>
        <CommonButton className="login-btn" type="text" style={{ fontWeight: '600' }} onClick={toLogin}>
          {t('Log In')}
        </CommonButton>
        <CommonButton className="signup-btn" style={{ fontWeight: '600' }} type="primary" onClick={toSignup}>
          {t('Sign Up')}
        </CommonButton>
      </>
    );
  };

  return (
    <Layout.Header className={clsx('site-header', isOpacity && 'opacity-header')}>
      <Row>
        <Col flex="146px">
          <NavLink to={list[0].path}>
            <IconLogo className="menu-logo" />
          </NavLink>
        </Col>
        <Col flex="1">
          <NavMenu />
        </Col>
        <Col className="header-right">
          <Network overlayClassName="network-wrap-pc" />
          {renderLoginPart()}
          <LanguageMenu />
        </Col>
      </Row>
    </Layout.Header>
  );
}

export default memo(PcHeader);
