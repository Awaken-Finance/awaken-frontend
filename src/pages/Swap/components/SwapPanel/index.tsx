import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { sleep } from 'utils';
import { StatusCodeEnum, TPairRoute, TSwapRoute } from '../../types';
import { SWAP_TIME_INTERVAL, ZERO } from 'constants/misc';
import { getSwapRoutes as getSwapRoutesInstant } from '../../utils';
import Font from 'components/Font';
import { ChainConstants } from 'constants/ChainConstants';
import { Currency } from '@awaken/sdk-core';
import { useCurrencyBalancesV2 } from 'hooks/useBalances';
import { getCurrencyAddress, parseUserSlippageTolerance } from 'utils/swap';
import SwapSelectTokenButton from '../SwapSelectTokenButton';
import SwapInputRow from '../SwapInputRow';
import { IconArrowDown2, IconPriceSwitch, IconSettingFee, IconSwapDefault, IconSwapHover } from 'assets/icons';
import { useDebounceCallback, useReturnLastCallback } from 'hooks';
import { Col, Row } from 'antd';
import clsx from 'clsx';
import CommonTooltip from 'components/CommonTooltip';
import { useTranslation } from 'react-i18next';
import SettingFee from 'Buttons/SettingFeeBtn';
import { useUserSettings } from 'contexts/useUserSettings';
import { divDecimals, timesDecimals } from 'utils/calculate';
import AuthBtn from 'Buttons/AuthBtn';
import { FontColor } from 'utils/getFontStyle';
import { SwapRouteInfo } from '../SwapRouteInfo';
import { useTokenPrice } from 'contexts/useTokenPrice/hooks';
import { formatSymbol } from 'utils/token';
import { useEffectOnce } from 'react-use';
import { useModalDispatch } from 'contexts/useModal/hooks';
import { basicModalView } from 'contexts/useModal/actions';
import { SwapConfirmModal, SwapConfirmModalInterface } from '../SwapConfirmModal';
import './styles.less';
import { CircleProcess, CircleProcessInterface } from 'components/CircleProcess';
import { formatPrice } from 'utils/price';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import { useIsConnected } from 'hooks/useLogin';
import { useTransactionFee } from 'contexts/useStore/hooks';
import { SWAP_RECEIVE_RATE } from 'constants/swap';
import BigNumber from 'bignumber.js';
import { DepositLink } from 'components/DepositLink';

export type TSwapInfo = {
  tokenIn?: Currency;
  tokenOut?: Currency;

  valueIn: string;
  valueOut: string;
  isFocusValueIn: boolean;
};

export const SwapPanel = () => {
  const { t } = useTranslation();
  const getSwapRoutes = useReturnLastCallback(getSwapRoutesInstant, []);

  const circleProcessRef = useRef<CircleProcessInterface>();
  const swapConfirmModalRef = useRef<SwapConfirmModalInterface>();
  const gasFee = useTransactionFee();

  const [swapInfo, setSwapInfo] = useState<TSwapInfo>({
    tokenIn: ChainConstants.constants.COMMON_BASES[2],
    tokenOut: ChainConstants.constants.COMMON_BASES[0],

    valueIn: '',
    valueOut: '',
    isFocusValueIn: true,
  });
  const swapInfoRef = useRef(swapInfo);
  swapInfoRef.current = swapInfo;
  const currencyBalances = useCurrencyBalancesV2([swapInfo.tokenIn, swapInfo.tokenOut]);
  const refreshTokenValueRef = useRef<typeof refreshTokenValue>();

  const routeListRef = useRef<TPairRoute[]>();

  const [swapRoute, setSwapRoute] = useState<TSwapRoute>();

  const [isPriceReverse, setIsPriceReverse] = useState(false);
  const resetIsPriceReverse = useCallback(() => {
    setIsPriceReverse(false);
  }, []);

  const [isRouteEmpty, setIsRouteEmpty] = useState(false);
  const executeCb = useCallback(async () => {
    const { tokenIn, tokenOut } = swapInfoRef.current;
    if (!tokenIn || !tokenOut) return;

    try {
      refreshTokenValueRef.current?.();
    } catch (error) {
      console.log('executeCb error', error);
    }
    return undefined;
  }, []);
  const executeCbRef = useRef(executeCb);
  executeCbRef.current = executeCb;

  const [isInvalidParis, setIsInvalidParis] = useState(false);
  const refreshTokenValue = useCallback(
    async (isInstant = false) => {
      const { tokenIn, tokenOut, valueIn, valueOut, isFocusValueIn } = swapInfoRef.current;
      if ((isFocusValueIn && valueIn === '') || (!isFocusValueIn && valueOut === '')) {
        setSwapInfo((pre) => ({
          ...pre,
          valueIn: '',
          valueOut: '',
        }));
        setSwapRoute(undefined);
        return;
      }

      if ((isFocusValueIn && ZERO.eq(valueIn)) || (!isFocusValueIn && ZERO.eq(valueOut))) {
        setIsInvalidParis(false);
        setSwapRoute(undefined);
        return;
      }

      if (!tokenIn || !tokenOut) {
        console.log('refreshTokenValue error', tokenIn, tokenOut);
        return;
      }

      const _getSwapRoutes = isInstant ? getSwapRoutesInstant : getSwapRoutes;

      try {
        const { routes, statusCode } = await _getSwapRoutes({
          symbolIn: tokenIn.symbol,
          symbolOut: tokenOut.symbol,
          isFocusValueIn,
          amountIn: isFocusValueIn ? timesDecimals(valueIn, tokenIn.decimals).toFixed() : undefined,
          amountOut: isFocusValueIn
            ? undefined
            : timesDecimals(valueOut, tokenOut.decimals).div(SWAP_RECEIVE_RATE).toFixed(0, BigNumber.ROUND_DOWN),
        });

        const _swapInfo = swapInfoRef.current;
        if (
          _swapInfo.tokenIn?.symbol !== tokenIn?.symbol ||
          _swapInfo.tokenOut?.symbol !== tokenOut?.symbol ||
          _swapInfo.isFocusValueIn !== isFocusValueIn ||
          (isFocusValueIn ? _swapInfo.valueIn !== valueIn : _swapInfo.valueOut !== valueOut)
        ) {
          console.log('calculateCb: to exceed the time limit');
          return;
        }

        setIsRouteEmpty(statusCode === StatusCodeEnum.NoRouteFound);
        setIsInvalidParis(statusCode === StatusCodeEnum.InsufficientLiquidity);
        const route = routes[0];

        const result = {
          valueIn: divDecimals(route.amountIn, tokenIn.decimals).toFixed(),
          valueOut: divDecimals(
            ZERO.plus(route.amountOut).times(SWAP_RECEIVE_RATE).dp(0, BigNumber.ROUND_CEIL),
            tokenOut.decimals,
          ).toFixed(),
          swapRoute: route,
        };

        setSwapInfo((pre) => ({
          ...pre,
          valueIn: result.valueIn,
          valueOut: result.valueOut,
        }));
        setSwapRoute(route);

        console.log('refreshTokenValue routes', route);

        return result;
      } catch (error) {
        console.log('refreshTokenValue error', error);
      }
    },
    [getSwapRoutes],
  );

  refreshTokenValueRef.current = refreshTokenValue;
  const refreshTokenValueDebounce = useDebounceCallback(refreshTokenValue, [refreshTokenValue]);

  const timerRef = useRef<NodeJS.Timeout>();

  const clearTimer = useCallback(() => {
    if (!timerRef.current) return;
    clearInterval(timerRef.current);
    timerRef.current = undefined;
    routeListRef.current = undefined;
    console.log('clearTimer');
  }, []);

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  const registerTimer = useCallback(() => {
    clearTimer();
    const { tokenIn, tokenOut } = swapInfoRef.current;
    if (!tokenIn || !tokenOut) return;

    executeCbRef.current();
    circleProcessRef.current?.start();
    timerRef.current = setInterval(() => {
      executeCbRef.current();
      circleProcessRef.current?.start();
    }, SWAP_TIME_INTERVAL);
  }, [clearTimer]);

  useEffectOnce(() => {
    const { tokenIn, tokenOut } = swapInfo;
    if (!tokenIn || !tokenOut) return;
    registerTimer();
  });

  const setValueIn = useCallback(
    async (value: string) => {
      setSwapInfo((pre) => ({
        ...pre,
        valueIn: value,
        valueOut: '',
        isFocusValueIn: true,
      }));
      refreshTokenValueDebounce();
    },
    [refreshTokenValueDebounce],
  );
  const setValueOut = useCallback(
    async (value: string) => {
      setSwapInfo((pre) => ({ ...pre, valueOut: value, valueIn: '', isFocusValueIn: false }));
      refreshTokenValueDebounce();
    },
    [refreshTokenValueDebounce],
  );

  const onTokenChange = useCallback(async () => {
    resetIsPriceReverse();
    setSwapRoute(undefined);
    setIsRouteEmpty(false);
    setIsInvalidParis(false);
    await sleep(100);
    registerTimer();
  }, [registerTimer, resetIsPriceReverse]);

  const setTokenIn = useCallback(
    async (tokenIn?: Currency) => {
      if (!tokenIn) return;
      setSwapInfo((pre) => {
        const isSwitch = pre.tokenOut?.symbol === tokenIn.symbol;
        if (!isSwitch)
          return {
            ...pre,
            tokenIn,
            isFocusValueIn: true,
            valueIn: '',
            valueOut: '',
          };
        return {
          ...pre,
          tokenIn,
          tokenOut: pre.tokenIn,
          isFocusValueIn: !pre.isFocusValueIn,
          valueOut: pre.isFocusValueIn ? pre.valueIn : '',
          valueIn: pre.isFocusValueIn ? '' : pre.valueOut,
        };
      });
      onTokenChange();
    },
    [onTokenChange],
  );

  const setTokenOut = useCallback(
    async (tokenOut?: Currency) => {
      if (!tokenOut) return;
      setSwapInfo((pre) => {
        const isSwitch = pre.tokenIn?.symbol === tokenOut.symbol;
        if (!isSwitch)
          return {
            ...pre,
            tokenOut,
            isFocusValueIn: true,
            valueOut: '',
          };

        return {
          ...pre,
          tokenOut,
          tokenIn: pre.tokenOut,
          isFocusValueIn: !pre.isFocusValueIn,
          valueOut: pre.isFocusValueIn ? pre.valueIn : '',
          valueIn: pre.isFocusValueIn ? '' : pre.valueOut,
        };
      });
      onTokenChange();
    },
    [onTokenChange],
  );

  const switchToken = useCallback(async () => {
    setSwapInfo((pre) => ({
      ...pre,
      tokenIn: pre.tokenOut,
      tokenOut: pre.tokenIn,
      isFocusValueIn: !pre.isFocusValueIn,
      valueOut: pre.isFocusValueIn ? pre.valueIn : '',
      valueIn: pre.isFocusValueIn ? '' : pre.valueOut,
    }));
    onTokenChange();
  }, [onTokenChange]);

  const priceLabel = useMemo(() => {
    const { tokenIn, tokenOut, valueIn, valueOut } = swapInfo;
    if (!tokenIn || !tokenOut) return '-';
    // if (!valueIn && !valueOut) return '-';
    const symbolIn = formatSymbol(tokenIn.symbol);
    const symbolOut = formatSymbol(tokenOut.symbol);

    if (!isPriceReverse) {
      if (!valueIn || !valueOut) return `1 ${symbolOut} = - ${symbolIn}`;

      const _price = formatPrice(ZERO.plus(valueIn).div(ZERO.plus(valueOut)));
      return `1 ${symbolOut} = ${_price} ${symbolIn}`;
    } else {
      if (!valueIn || !valueOut) return `1 ${symbolIn} = - ${symbolOut}`;

      const _price = formatPrice(ZERO.plus(valueOut).div(ZERO.plus(valueIn)));
      return `1 ${symbolIn} = ${_price} ${symbolOut}`;
    }
  }, [isPriceReverse, swapInfo]);

  const onReversePrice = useCallback(() => {
    setIsPriceReverse((pre) => !pre);
  }, []);

  const [isDetailShow, setIsDetailShow] = useState(false);
  const switchDetailShow = useCallback(() => {
    setIsDetailShow((pre) => !pre);
  }, []);
  const [{ userSlippageTolerance }] = useUserSettings();
  const slippageValue = useMemo(() => {
    return ZERO.plus(parseUserSlippageTolerance(userSlippageTolerance)).dp(2).toString();
  }, [userSlippageTolerance]);

  const isExtraInfoShow = useMemo(() => {
    const { tokenIn, tokenOut } = swapInfo;
    if (!tokenIn || !tokenOut) return false;
    // if (!valueIn && !valueOut) return false;
    return true;
  }, [swapInfo]);

  const isExceedBalance = useMemo(() => {
    const { tokenIn, valueIn } = swapInfo;
    if (!tokenIn) return false;
    const tokenInBalance = currencyBalances?.[getCurrencyAddress(swapInfo.tokenIn)];
    if (tokenInBalance === undefined) return true;
    const validBalance = tokenIn.symbol === 'ELF' ? ZERO.plus(tokenInBalance).minus(gasFee) : tokenInBalance;
    if (ZERO.plus(valueIn).gt(divDecimals(validBalance, tokenIn.decimals))) return true;
    return false;
  }, [currencyBalances, gasFee, swapInfo]);

  const { isLocking } = useConnectWallet();
  const isConnected = useIsConnected();

  const swapBtnInfo = useMemo<{
    active?: boolean;
    label: string;
    className?: string;
    fontColor?: FontColor;
    type?: 'primary';
  }>(() => {
    if (!isConnected) return { label: t(isLocking ? 'Unlock' : 'connectWallet'), fontColor: 'primary', active: true };
    const { tokenIn, tokenOut, isFocusValueIn, valueIn, valueOut } = swapInfo;
    if (!tokenIn || !tokenOut) return { label: t('selectAToken'), fontColor: 'two' };
    if (isRouteEmpty) return { label: t('Go To Create'), active: true, type: 'primary' };
    if (isFocusValueIn && (!valueIn || ZERO.eq(valueIn))) return { label: t('Enter an amount'), fontColor: 'two' };
    if (!isFocusValueIn && (!valueOut || ZERO.eq(valueOut))) return { label: t('Enter an amount'), fontColor: 'two' };

    if (isInvalidParis) return { label: t('Insufficient liquidity for this trade'), className: 'swap-btn-error' };
    if (isExceedBalance)
      return {
        label: t(`insufficientBalance`, { symbol: formatSymbol(tokenIn?.symbol) }),
        className: 'swap-btn-error',
      };
    return {
      active: true,
      className: 'swap-btn-active',
      label: t('Swap'),
      type: 'primary',
    };
  }, [isConnected, isExceedBalance, isInvalidParis, isLocking, isRouteEmpty, swapInfo, t]);

  const [isSwapping, setIsSwapping] = useState(false);
  const modalDispatch = useModalDispatch();
  const onSwapClick = useCallback(async () => {
    const { tokenIn, tokenOut, valueIn, valueOut } = swapInfo;
    if (!tokenIn || !tokenOut) return;

    if (isRouteEmpty) {
      modalDispatch(
        basicModalView.setSwapNotSupported.actions({
          tokenIn,
          tokenOut,
        }),
      );
      return;
    }

    if (!valueIn || !valueOut) return;

    const _refreshTokenValue = refreshTokenValueRef.current;
    if (!_refreshTokenValue) return;
    setIsSwapping(true);
    try {
      const result = await _refreshTokenValue(true);
      // can not get routeInfo
      if (!result || !result.swapRoute) return;

      const route = result.swapRoute;
      const _tokens = route.distributions[0]?.tokens;
      const routeSymbolIn = _tokens[0].symbol;
      const routeSymbolOut = _tokens[_tokens.length - 1]?.symbol;
      // swapInfo do not match routeInfo
      if (tokenIn.symbol !== routeSymbolIn || tokenOut.symbol !== routeSymbolOut) return;

      swapConfirmModalRef.current?.show({
        swapInfo: {
          ...swapInfo,
          valueIn: result.valueIn,
          valueOut: result.valueOut,
        },
        swapRoute: route,
        priceLabel,
      });
    } catch (error) {
      console.log('error', error);
    } finally {
      console.log('onSwap finally');
      setIsSwapping(false);
    }
  }, [isRouteEmpty, modalDispatch, priceLabel, swapInfo]);

  const onSwapSuccess = useCallback(() => {
    setSwapInfo((pre) => ({
      ...pre,
      valueIn: '',
      valueOut: '',
    }));
    setSwapRoute(undefined);
    registerTimer();
  }, [registerTimer]);

  const tokenInPrice = useTokenPrice({ symbol: swapInfo.tokenIn?.symbol });
  const tokenOutPrice = useTokenPrice({ symbol: swapInfo.tokenOut?.symbol });
  const usdImpactInfo = useMemo(() => {
    const { tokenIn, tokenOut, valueIn, valueOut } = swapInfo;
    if (!tokenIn || !tokenOut || !valueIn || !valueOut) return undefined;

    if (
      !tokenInPrice ||
      tokenInPrice === '0' ||
      !tokenOutPrice ||
      tokenOutPrice === '0' ||
      ZERO.eq(valueIn) ||
      ZERO.eq(valueOut)
    )
      return;

    const priceIn = ZERO.plus(valueIn).times(tokenInPrice);
    const priceOut = ZERO.plus(valueOut).times(tokenOutPrice);
    const _impact = priceOut.minus(priceIn).div(priceIn).times(100).dp(2);
    let fontColor: FontColor = 'two';
    if (_impact.gt(ZERO)) {
      fontColor = 'rise';
    } else if (_impact.lt(ZERO)) {
      fontColor = 'fall';
    }

    return {
      label: `${_impact.gt(ZERO) ? '+' : ''}${_impact.toFixed()}%`,
      fontColor,
    };
  }, [swapInfo, tokenInPrice, tokenOutPrice]);

  return (
    <>
      <div className="swap-panel">
        <SwapInputRow
          title={t('Pay')}
          value={swapInfo.valueIn}
          onChange={setValueIn}
          balance={currencyBalances?.[getCurrencyAddress(swapInfo.tokenIn)]}
          token={swapInfo.tokenIn}
          showMax={true}
          gasFee={gasFee}
          suffix={
            <SwapSelectTokenButton
              className="swap-select-token-btn"
              type="default"
              size="middle"
              token={swapInfo.tokenIn}
              setToken={setTokenIn}
            />
          }
        />
        <div className="swap-token-switch-wrap">
          <div className="swap-token-switch-btn" onClick={switchToken}>
            <IconSwapDefault className="swap-token-switch-btn-default" />
            <IconSwapHover className="swap-token-switch-btn-hover" />
          </div>
        </div>
        <SwapInputRow
          className="swap-input-out-row"
          title={t('Receive')}
          value={swapInfo.valueOut}
          onChange={setValueOut}
          balance={currencyBalances?.[getCurrencyAddress(swapInfo.tokenOut)]}
          token={swapInfo.tokenOut}
          suffix={
            <SwapSelectTokenButton
              className="swap-select-token-btn"
              type="default"
              size="middle"
              token={swapInfo.tokenOut}
              setToken={setTokenOut}
            />
          }
          usdSuffix={
            <>
              {usdImpactInfo && (
                <Font size={14} color={usdImpactInfo?.fontColor}>
                  {usdImpactInfo?.label}
                </Font>
              )}
            </>
          }
        />

        {isRouteEmpty && (
          <div className="route-empty-warning">
            <div className="route-empty-warning-icon-wrap">
              <span className="route-empty-warning-icon" />
            </div>
            <Font color="two" lineHeight={20}>
              {t('The current transaction is not supported, You can create the pair yourself.')}
            </Font>
          </div>
        )}

        <div className="swap-btn-wrap">
          <AuthBtn
            type={swapBtnInfo.type}
            size="large"
            className={clsx('swap-btn', swapBtnInfo.className)}
            onClick={onSwapClick}
            loading={isSwapping}
            disabled={!swapBtnInfo.active}>
            <Font size={16} color={swapBtnInfo.fontColor}>
              {swapBtnInfo.label}
            </Font>
          </AuthBtn>
        </div>

        {isExceedBalance && <DepositLink />}

        {isExtraInfoShow && (
          <>
            <Row className="swap-extra-wrap" align={'middle'} justify={'space-between'}>
              <Col className="price-warp">
                {priceLabel !== '-' && (
                  <>
                    <Font size={16} lineHeight={24}>
                      {priceLabel}
                    </Font>
                    <IconPriceSwitch className="price-switch-btn" onClick={onReversePrice} />
                  </>
                )}

                <CircleProcess ref={circleProcessRef} />
              </Col>
              <Col>
                <IconArrowDown2
                  className={clsx('swap-detail-btn', isDetailShow && 'swap-detail-btn-show')}
                  onClick={switchDetailShow}
                />
              </Col>
            </Row>

            <div className={clsx('swap-detail', isDetailShow && 'swap-detail-show')}>
              <Row align={'middle'} justify={'space-between'}>
                <Col className="swap-detail-title">
                  <Font color="two" size={14} lineHeight={22}>
                    {t('slippageTolerance')}
                  </Font>

                  <CommonTooltip
                    placement="top"
                    title={t('tradingSettingTip1')}
                    getPopupContainer={(v) => v}
                    buttonTitle={t('ok')}
                    headerDesc={t('slippageTolerance')}
                  />
                </Col>

                <Row gutter={[4, 0]} align="middle">
                  <Col>
                    <Font size={14} lineHeight={22} suffix="%">
                      {slippageValue}
                    </Font>
                  </Col>
                  <Col>
                    <SettingFee className="slippage-set-fee">
                      <IconSettingFee />
                    </SettingFee>
                  </Col>
                </Row>
              </Row>

              {swapRoute && <SwapRouteInfo swapInfo={swapInfo} swapRoute={swapRoute} gasFee={gasFee} />}
            </div>
          </>
        )}
      </div>

      <SwapConfirmModal
        ref={swapConfirmModalRef}
        tokenInPrice={tokenInPrice}
        tokenOutPrice={tokenOutPrice}
        gasFee={gasFee}
        onSuccess={onSwapSuccess}
      />
    </>
  );
};
