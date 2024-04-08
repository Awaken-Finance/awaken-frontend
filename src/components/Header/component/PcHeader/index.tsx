import { Layout, Row, Col } from 'antd';
import { IconArrowDown, IconLogo } from 'assets/icons';
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
import Font from 'components/Font';

function PcHeader() {
  const { selectedKeys } = useSelectedKeys();
  const { loginState } = useWebLogin();
  const pathname = useLocation().pathname;
  const { t } = useTranslation();
  // const history = useHistory();
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
        <Col>
          <CommonButton onClick={toggleAccountModal} className="my-btn">
            <div className="my-btn-content">
              <IconUser />
              <Font size={14} className="my-btn-content-font">
                {t('My')}
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
          <CommonButton className="signup-btn" type="text" style={{ fontWeight: '600' }} onClick={toLogin}>
            {t('Log In')}
          </CommonButton>
        </Col>
        <Col>
          <CommonButton className="signup-btn" style={{ fontWeight: '600' }} type="primary" onClick={toSignup}>
            {t('Sign Up')}
          </CommonButton>
        </Col>
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
    </Layout.Header>
  );
}

export default memo(PcHeader);
