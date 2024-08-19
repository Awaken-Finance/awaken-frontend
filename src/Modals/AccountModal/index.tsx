import { useModal } from 'contexts/useModal';
import { basicModalView } from 'contexts/useModal/actions';
import { useMobile } from 'utils/isMobile';
import { Row, Carousel, Modal, Col } from 'antd';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CarouselRef } from 'antd/lib/carousel';
import AccountInfo from './AccountInfo';
import CommonButton from 'components/CommonButton';
import Font from 'components/Font';
import { IconArrowDown, IconArrowRight4, IconArrowUp, IconClose } from 'assets/icons';
import MyTokenList from './MyTokenList';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import './styles.less';
import clsx from 'clsx';
import {
  useUserAssetTokenList,
  useUserCombinedAssets,
  useUserLimits,
  useUserPositions,
  useUserTransactions,
} from 'hooks/useUserAsset';
import { CurrencyLogos } from 'components/CurrencyLogo';
import { Pairs } from 'components/Pair';
import FeeRate from 'components/FeeRate';
import { formatPercentage } from 'utils/price';
import PriceUSDDigits from 'components/PriceUSDDigits';
import getFontStyle from 'utils/getFontStyle';
import moment from 'moment';
import { SIDE_COLOR_MAP, SIDE_LABEL_MAP } from 'constants/swap';
import CommonLink from 'components/CommonLink';
import { ZERO } from 'constants/misc';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import myEvents from 'utils/myEvent';
import { getLimitOrderPrice } from 'utils/limit';
import PriceDigits from 'components/PriceDigits';
import { formatSymbol } from 'utils/token';

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
    key: 'limits',
    title: 'Limits',
  },
  {
    key: 'transactions',
    title: 'recentTransaction',
  },
];

function AccountModal() {
  const [{ accountModal: isAccountModalShow }, { dispatch }] = useModal();
  const [showHiddenTokens, setShowHiddenTokens] = useState(false);
  const { walletInfo, disConnectWallet } = useConnectWallet();
  const history = useHistory();
  const carouselRef = useRef<CarouselRef>(null);
  const isMobile = useMobile();

  const [menu, setMenu] = useState(MENU_LIST[0].key);
  const { list: userTokenList } = useUserAssetTokenList(isAccountModalShow && menu === 'tokens');
  const { userPositions } = useUserPositions(isAccountModalShow && menu === 'positions');
  const { list: userTxList } = useUserTransactions(isAccountModalShow && menu === 'transactions');
  const { list: limitList } = useUserLimits(isAccountModalShow && menu === 'limits');
  const { data: userCombinedAssets, refresh: refreshUserCombinedAssets } = useUserCombinedAssets(isAccountModalShow);

  useEffect(() => {
    refreshUserCombinedAssets();
  }, [menu, refreshUserCombinedAssets]);

  const { t } = useTranslation();

  const onClose = useCallback(() => {
    dispatch(basicModalView.setAccountModal.actions(false));
    carouselRef.current?.goTo(0, true);
  }, [dispatch]);

  const onClickLogout = async () => {
    dispatch(basicModalView.setAccountModal.actions(false));
    try {
      await disConnectWallet();
      myEvents.DisconnectWallet.emit();
    } catch (error) {
      console.log('disconnectWallet error', error);
    }
  };

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
          <MyTokenList items={userTokenList.showList} address={walletInfo?.address || ''} />
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
                <MyTokenList items={userTokenList.hiddenList} address={walletInfo?.address || ''} />
              </Row>
            )}
          </>
        )}
      </>
    );
  }, [onExploreClick, showHiddenTokens, t, userTokenList.hiddenList, userTokenList.showList, walletInfo?.address]);

  const onAddLiquidityClick = useCallback(() => {
    history.push('/liquidity/ELF_USDT_0.05/add');
    onClose();
  }, [history, onClose]);

  const onPositionsViewAll = useCallback(() => {
    history.push('/portfolio');
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
      <>
        <div className="account-modal-position-list">
          {userPositions?.items?.map((item) => (
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
                <PriceUSDDigits
                  className={getFontStyle({ size: 16, lineHeight: 24 })}
                  price={item.position.valueInUsd}
                />
                <Font size={12} lineHeight={16} color="two">{`APR  ${ZERO.plus(item.estimatedAPR[0]?.percent)
                  .dp(2)
                  .toFixed()}%`}</Font>
              </div>
            </div>
          ))}
        </div>
        <div className="account-modal-view-more-btn">
          <CommonLink color="two" onClick={onPositionsViewAll} iconProps={{ size: 16, color: 'two' }}>
            {t('Details')}
          </CommonLink>
        </div>
      </>
    );
  }, [onAddLiquidityClick, onPositionsViewAll, t, userPositions?.items]);

  const onAddLimitClick = useCallback(() => {
    history.push('/swap/limit');
    onClose();
  }, [history, onClose]);
  const onLimitViewAll = useCallback(() => {
    history.push('/transactions/limit');
    onClose();
  }, [history, onClose]);

  const userLimitDom = useMemo(() => {
    if (!limitList?.length) {
      return (
        <div className="account-modal-list-empty">
          <div className="account-modal-list-empty-title">
            <Font size={16} color="two" lineHeight={24} weight="bold">
              {t('No Limits yet')}
            </Font>
            <Font size={14} color="two" weight="regular">
              {t('noLimitDescription')}
            </Font>
          </div>
          <CommonButton type="primary" onClick={onAddLimitClick}>
            {t('Create a limit order')}
          </CommonButton>
        </div>
      );
    }

    return (
      <>
        <div className="account-modal-position-list">
          {limitList?.map((item) => (
            <div key={item.orderId} className="account-modal-position-item">
              <CurrencyLogos isSortToken={false} size={24} tokens={[item.tradePair.token0, item.tradePair.token1]} />
              <div className="account-modal-position-item-middle account-modal-limit-middle">
                <div className="account-modal-limit-header">
                  <Font size={12} lineHeight={16} color="two">{`${t(`When`)} `}</Font>
                  <PriceDigits
                    wrapperClassName={getFontStyle({ lineHeight: 16, size: 12, color: 'two' })}
                    className={getFontStyle({ lineHeight: 16, size: 12, color: 'two' })}
                    price={getLimitOrderPrice(item)}
                  />
                  <Font lineHeight={16} size={12} color="two">
                    {` ${formatSymbol(item.symbolOut)}/${formatSymbol(item.symbolIn)}`}
                  </Font>
                </div>
                <div className="account-modal-limit-content">
                  <Font size={16} lineHeight={24}>{`${item.amountIn} ${formatSymbol(item.symbolIn)}`}</Font>
                  <IconArrowRight4 />
                  <Font size={16} lineHeight={24}>{`${item.amountOut} ${formatSymbol(item.symbolOut)}`}</Font>
                </div>
                <Font size={12} lineHeight={16} color="two">{`${t('Expires')} ${moment(item.deadline).format(
                  'YYYY-MM-DD HH:mm',
                )}`}</Font>
              </div>
            </div>
          ))}
        </div>
        <div className="account-modal-view-more-btn">
          <CommonLink color="two" onClick={onLimitViewAll} iconProps={{ size: 16, color: 'two' }}>
            {t('Details')}
          </CommonLink>
        </div>
      </>
    );
  }, [limitList, onAddLimitClick, onLimitViewAll, t]);

  const onTransactionsViewAll = useCallback(() => {
    history.push('/transactions');
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
        <div className="account-modal-position-list">
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
            {t('Details')}
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
      <Carousel ref={carouselRef} dots={false} autoplay={false} swipe={false}>
        <div className="account-content">
          <AccountInfo onClickLogout={onClickLogout} />

          <div className="account-content-title">
            <PriceUSDDigits
              className={getFontStyle({ lineHeight: 48, size: 40, color: 'one', weight: 'medium' })}
              price={userCombinedAssets?.valueInUsd ?? 0}
            />
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
          {menu === 'limits' && userLimitDom}
          {menu === 'transactions' && transactionsDom}
        </div>
      </Carousel>
    </Modal>
  );
}

export default AccountModal;
