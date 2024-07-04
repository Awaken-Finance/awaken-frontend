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
import { useCallback, useMemo, useRef, useState } from 'react';
import { CarouselRef } from 'antd/lib/carousel';
import AccountInfo from './AccountInfo';
import CommonButton from 'components/CommonButton';
import SwitchWallets from './SwitchWallets';
import Font from 'components/Font';
import { IconArrowDown, IconArrowRight, IconArrowUp, IconClose } from 'assets/icons';
import MyTokenList from './MyTokenList';
import { NavLink, matchPath, useHistory } from 'react-router-dom';
import { detectDiscoverProvider, detectNightElf } from 'aelf-web-login';
import { useTranslation } from 'react-i18next';
import { routes } from 'routes';
import querystring from 'query-string';

import './styles.less';
import clsx from 'clsx';
import { useUserAssetTokenList, useUserPositions, useUserTransactions } from 'hooks/useUserAsset';
import { CurrencyLogos } from 'components/CurrencyLogo';
import { Pairs } from 'components/Pair';
import FeeRate from 'components/FeeRate';
import { formatPercentage } from 'utils/price';
import PriceUSDDigits from 'components/PriceUSDDigits';
import getFontStyle from 'utils/getFontStyle';
import moment from 'moment';
import { SIDE_COLOR_MAP, SIDE_LABEL_MAP } from 'constants/swap';
import { ZERO } from 'constants/misc';
import CommonLink from 'components/CommonLink';

const MENU_LIST = [
  {
    key: 'tokens',
    title: 'tokens',
  },
  {
    key: 'positions',
    title: 'Positions',
  },
  {
    key: 'transactions',
    title: 'recentTransaction',
  },
];

function AccountModal() {
  const [{ accountModal: isAccountModalShow }, { dispatch }] = useModal();
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

  const [menu, setMenu] = useState(MENU_LIST[0].key);
  const { list: userTokenList } = useUserAssetTokenList(isAccountModalShow && menu === 'tokens');
  const { userPositions } = useUserPositions(isAccountModalShow && menu === 'positions');
  const { list: userTxList } = useUserTransactions(isAccountModalShow && menu === 'transactions');

  const isSwitchingWallet = useMemo(() => checkingPlugin && switching, [checkingPlugin, switching]);
  const { t } = useTranslation();

  const toWalletInfo = () => {
    corousel.current?.goTo(0);
  };
  const toSwitchWallet = () => {
    corousel.current?.goTo(1);
  };

  const onClose = useCallback(() => {
    dispatch(basicModalView.setAccountModal.actions(false));
    corousel.current?.goTo(0, true);
  }, [dispatch]);

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

  const onExploreClick = useCallback(() => {
    history.push('/overview');
    onClose();
  }, [history, onClose]);

  const tokenList = useMemo(() => {
    const isEmpty = userTokenList.showList.length + userTokenList.hiddenList.length === 0;

    if (isEmpty)
      return (
        <div className="account-modal-list-empty">
          <div className="account-modal-list-empty-title">
            <Font size={16} color="two" lineHeight={24} weight="bold">
              {t('NoTokens')}
            </Font>
            <Font size={14} color="two" weight="regular">
              {t('NoTokensDesc')}
            </Font>
          </div>
          <CommonButton onClick={onExploreClick} type="primary">
            {t('Explore Market')}
          </CommonButton>
        </div>
      );

    return (
      <>
        <Row>
          <MyTokenList items={userTokenList.showList} address={address} />
        </Row>

        {userTokenList.hiddenList.length > 0 && (
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
        )}
      </>
    );
  }, [address, onExploreClick, showHiddenTokens, t, userTokenList.hiddenList, userTokenList.showList]);

  const onAddLiquidityClick = useCallback(() => {
    history.push('/liquidity/ELF_USDT_0.05/add');
    onClose();
  }, [history, onClose]);

  const userPositionsDom = useMemo(() => {
    if (!userPositions?.items?.length) {
      return (
        <div className="account-modal-list-empty">
          <div className="account-modal-list-empty-title">
            <Font size={16} color="two" lineHeight={24} weight="bold">
              {t('No positions yet')}
            </Font>
            <Font size={14} color="two" weight="regular">
              {t('Open a new position or create a pool to get started')}
            </Font>
          </div>
          <CommonButton type="primary" onClick={onAddLiquidityClick}>{`+ ${t('Add Liquidity')}`}</CommonButton>
        </div>
      );
    }

    return (
      <div className="account-modal-position-list">
        {userPositions.items?.map((item) => (
          <div key={item.tradePairInfo.address} className="account-modal-position-item">
            <CurrencyLogos size={24} tokens={[item?.tradePairInfo?.token0, item?.tradePairInfo?.token1]} />
            <div className="account-modal-position-item-middle">
              <Pairs
                tokenA={item?.tradePairInfo?.token0}
                tokenB={item?.tradePairInfo?.token1}
                lineHeight={24}
                size={16}
                weight="medium"
              />
              <div className="account-modal-position-fee-wrap">
                <FeeRate useBg>{formatPercentage(item?.tradePairInfo?.feeRate * 100)}</FeeRate>
              </div>
            </div>
            <div className="account-modal-position-item-right">
              <PriceUSDDigits className={getFontStyle({ size: 16, lineHeight: 24 })} price={item.position.valueInUsd} />
              <Font size={12} lineHeight={16} color="two">{`APR  ${ZERO.plus(item.estimatedAPR[0]?.percent)
                .dp(2)
                .toFixed()}%`}</Font>
            </div>
          </div>
        ))}
      </div>
    );
  }, [onAddLiquidityClick, t, userPositions]);

  const onTransactionsViewAll = useCallback(() => {
    history.push('/user-center/transaction');
    onClose();
  }, [history, onClose]);

  const transactionsDom = useMemo(() => {
    if (!userTxList?.length)
      return (
        <div className="account-modal-list-empty">
          <div className="account-modal-list-empty-title">
            <Font size={16} color="two" weight="bold">
              {t('No transactions yet')}
            </Font>
          </div>
        </div>
      );

    return (
      <>
        <div className="account-modal-position-list account-modal-transactions-list">
          {userTxList?.map((item) => (
            <div key={item.id} className="account-modal-position-item">
              <CurrencyLogos size={24} tokens={[item?.tradePair?.token0, item?.tradePair?.token1]} />
              <div className="account-modal-position-item-middle">
                <Pairs
                  tokenA={item?.tradePair?.token0}
                  tokenB={item?.tradePair?.token1}
                  lineHeight={24}
                  size={16}
                  weight="medium"
                />
                <Font size={12} lineHeight={20} color="two">
                  {moment(item.timestamp).format('YYYY-MM-DD HH:mm:ss')}
                </Font>
              </div>
              <div className="account-modal-position-item-right">
                <Font lineHeight={24} size={14} color={SIDE_COLOR_MAP[item.side ?? 2]}>
                  {t(SIDE_LABEL_MAP[item.side ?? 2])}
                </Font>
                <PriceUSDDigits
                  className={getFontStyle({ lineHeight: 16, size: 12, color: 'two' })}
                  price={item.totalPriceInUsd}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="account-modal-view-more-btn">
          <CommonLink color="two" onClick={onTransactionsViewAll} iconProps={{ size: 16, color: 'two' }}>
            {t('View More')}
          </CommonLink>
        </div>
      </>
    );
  }, [onTransactionsViewAll, t, userTxList]);

  return (
    <Modal
      // destroyOnClose
      className="account-modal"
      visible={isAccountModalShow}
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
          <AccountInfo onClickLogout={onClickLogout} onClickSwitchWallet={toSwitchWallet} />

          <div className="account-content-list">
            <NavLink to="/user-center/exchange" className="account-content-item" onClick={onClose}>
              <Font weight="bold" lineHeight={24} size={16}>
                {t('myMarketingMakingLiquidity')}
              </Font>
              <IconArrowRight />
            </NavLink>
          </div>

          <div className="account-modal-menu-header">
            {MENU_LIST.map((item) => (
              <div
                key={item.key}
                className={clsx(['account-modal-menu-item', menu === item.key && 'account-modal-menu-item-active'])}
                onClick={() => {
                  setMenu(item.key);
                }}>
                <Font size={16} lineHeight={24} color="two" weight={menu === item.key ? 'medium' : 'regular'}>
                  {t(item.title)}
                </Font>
              </div>
            ))}
          </div>

          {menu === 'tokens' && tokenList}
          {menu === 'positions' && userPositionsDom}
          {menu === 'transactions' && transactionsDom}
        </div>
        <div className="account-switch">
          <SwitchWallets onClickBack={toWalletInfo} onSwitchWallet={onClickSwitchWallet} />
        </div>
      </Carousel>
    </Modal>
  );
}

export default AccountModal;
