import { useCallback, useContext, useMemo, useState } from 'react';
import { MenuInfo } from 'rc-menu/lib/interface';
import { UserCenterContext } from 'pages/UserCenter/hooks/useUserCenter';
// import { useHistory } from 'react-router';
import { useMobile } from 'utils/isMobile';
import { useTranslation } from 'react-i18next';
import useOverviewOfUser from 'pages/UserCenter/hooks/useOverviewOfUser';
import Font from 'components/Font';
import CommonDropdown from 'components/CommonDropdown';
import CommonButton from 'components/CommonButton';
import { IconArrowDown, IconCheckPrimary } from 'assets/icons';
import { Col, Menu, Row } from 'antd';
// import BigNumber from 'bignumber.js';
import CommonModal from 'components/CommonModal';
import { formatPriceUSDWithSymBol } from 'utils/price';
import isShowUSD from 'utils/isShowUSD';
import CommonTooltip from 'components/CommonTooltip';
import './AssetOverview.less';
import usePriceType from './hooks/usePriceType';

export function AssetOverview() {
  const { t } = useTranslation();

  const [priceDropdownVisible, setPriceDropdownVisible] = useState(false);
  const [priceDrawerVisible, setPriceDrawerVisible] = useState(false);

  const [{ priceType = 'BTC' }, { savePriceType = () => null }] = usePriceType();

  const isMobile = useMobile();

  const assetAll = useOverviewOfUser();
  const {
    state: { userAssetHidden },
    BTCPrice,
    ELFPrice,
    ETHPrice,
  } = useContext(UserCenterContext);

  const priceMap = useMemo<{ [key: string]: string }>(
    () => ({
      USDT: '1',
      BTC: BTCPrice,
      ETH: ETHPrice,
      ELF: ELFPrice,
    }),
    [ELFPrice, BTCPrice, ETHPrice],
  );

  const displayTotalNetValue = useMemo(() => {
    const price = priceMap[priceType];
    if (!price || !assetAll) return 0;
    if (parseFloat(price) <= 0) return 0;
    return assetAll.all.div(price).dp(6);
  }, [assetAll, priceMap, priceType]);

  const onPriceTypeChange = useCallback(
    (e: MenuInfo) => {
      setPriceDropdownVisible(false);
      setPriceDrawerVisible(false);
      savePriceType(e.key);
    },
    [savePriceType],
  );

  const menu = useMemo(() => {
    const priceTypes = ['BTC', 'USDT', 'ETH', 'ELF'];
    return (
      <Menu selectedKeys={[priceType]} onClick={onPriceTypeChange}>
        {priceTypes.map((item) => {
          return (
            <Menu.Item key={item}>
              <span>{item}</span>
              {item === priceType && <IconCheckPrimary />}
            </Menu.Item>
          );
        })}
      </Menu>
    );
  }, [onPriceTypeChange, priceType]);

  const style = useMemo(() => {
    if (isMobile) {
      return 'my-assets-m';
    } else {
      return 'my-assets';
    }
  }, [isMobile]);

  const assetUSD = useMemo(() => {
    if (!isShowUSD()) return 0;
    return userAssetHidden ? '******' : formatPriceUSDWithSymBol(assetAll.all, '≈ ');
  }, [assetAll.all, userAssetHidden]);

  const handleClick = () => {
    if (isMobile) {
      setPriceDrawerVisible(!priceDrawerVisible);
    } else {
      setPriceDropdownVisible(!priceDropdownVisible);
    }
  };

  return (
    <div className={style}>
      {!isMobile && (
        <Font lineHeight={48} size={32} weight={'bold'} className="my-assets-title">
          {t('My Assets')}
        </Font>
      )}
      <div className="my-assets-container">
        <div className="total-value-title">
          <Font size={isMobile ? 16 : 18} lineHeight={isMobile ? 24 : 26} weight={'medium'}>
            {t('totalNetVal')}
          </Font>
          <CommonTooltip
            title={t('The total value of the liquidity you have added to AwakenSwap')}
            buttonTitle={t('ok')}
            headerDesc={t('totalNetVal')}
          />
        </div>
        <div>
          <Row>
            <Col>
              <Font size={24} lineHeight={36} weight={'bold'} color="one" className="price">
                {userAssetHidden ? '******' : `${displayTotalNetValue} ${priceType}`}
              </Font>
            </Col>
            <Col className="price-dropdown-col">
              <CommonDropdown
                overlayClassName="price-dropdown-menus"
                placement="bottom"
                trigger={['click']}
                visible={priceDropdownVisible}
                overlay={menu}>
                <CommonButton
                  type="text"
                  className="price-dropdown-btn"
                  icon={<IconArrowDown />}
                  onClick={handleClick}
                />
              </CommonDropdown>
            </Col>
            <Col xs={24} sm={12}>
              {isShowUSD() && (
                <Font size={24} lineHeight={36} weight={'bold'} color="two" className="price">
                  {assetUSD}
                </Font>
              )}
            </Col>
          </Row>
        </div>
      </div>
      <CommonModal
        className="price-select-modal"
        title={t('SelectCalculatedCrypto')}
        onCancel={() => setPriceDrawerVisible(false)}
        visible={priceDrawerVisible}
        height="250px">
        {menu}
      </CommonModal>
    </div>
  );
}
