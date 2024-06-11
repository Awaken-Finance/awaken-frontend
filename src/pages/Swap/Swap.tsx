import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { sleep } from 'utils';
import { useGetRouteList } from './hooks';
import { TPairRoute, TSwapRouteInfo } from './types';
import { ONE, REQ_CODE, ZERO } from 'constants/misc';

import { getContractAmountOut, getRouteInfoWithValueIn, getRouteInfoWithValueOut } from './utils';
import './styles.less';
import Font from 'components/Font';

import { ChainConstants } from 'constants/ChainConstants';
import { Currency } from '@awaken/sdk-core';
import { useCurrencyBalances } from 'hooks/useBalances';
import {
  bigNumberToString,
  bigNumberToUPString,
  getCurrencyAddress,
  getPriceImpactWithBuy,
  minimumAmountOut,
  parseUserSlippageTolerance,
} from 'utils/swap';
import SwapSelectTokenButton from './components/SwapSelectTokenButton';
import SwapInputRow from './components/SwapInputRow';
import { IconArrowDown2, IconPriceSwitch, IconSettingFee, IconSwapDefault, IconSwapHover } from 'assets/icons';
import { useReturnLastCallback } from 'hooks';
import { Col, Row } from 'antd';
import { SwapCircleProcess, SwapCircleProcessInterface } from './components/SwapCircleProcess';
import clsx from 'clsx';
import CommonTooltip from 'components/CommonTooltip';
import { useTranslation } from 'react-i18next';
import SettingFee from 'Buttons/SettingFeeBtn';
import { useUserSettings } from 'contexts/useUserSettings';
import BigNumber from 'bignumber.js';
import { useRequest } from 'ahooks';
import { getTransactionFee } from 'pages/Exchange/apis/getTransactionFee';
import { divDecimals, timesDecimals } from 'utils/calculate';
import { CurrencyLogos } from 'components/CurrencyLogo';
import { SwapOrderRouting } from './components/SwapOrderRouting';
import { WebLoginState, useWebLogin } from 'aelf-web-login';
import AuthBtn from 'Buttons/AuthBtn';
import { FontColor } from 'utils/getFontStyle';
import { useRouterContract } from 'hooks/useContract';
import { SupportedSwapRateMap } from 'constants/swap';
import { useActiveWeb3React } from 'hooks/web3';
import useAllowanceAndApprove from 'hooks/useApprove';
import { onSwap } from 'utils/swapContract';

type TSwapInfo = {
  tokenIn?: Currency;
  tokenOut?: Currency;

  valueIn: string;
  valueOut: string;
  isFocusValueIn: boolean;
};

type TCalculateCbResult =
  | {
      valueIn: string;
      valueOut: string;
      routeInfo?: TSwapRouteInfo;
    }
  | undefined;

export const Swap = () => {
  const { t } = useTranslation();
  const _getRouteList = useGetRouteList();
  const getRouteList = useReturnLastCallback(_getRouteList, [_getRouteList]);
  const swapCircleProcessRef = useRef<SwapCircleProcessInterface>();
  const { data: gasFee = 0 } = useRequest(getTransactionFee);

  const [swapInfo, setSwapInfo] = useState<TSwapInfo>({
    tokenIn: ChainConstants.constants.COMMON_BASES[0],
    tokenOut: undefined,

    valueIn: '',
    valueOut: '',
    isFocusValueIn: true,
  });
  const swapInfoRef = useRef(swapInfo);
  swapInfoRef.current = swapInfo;
  const currencyBalances = useCurrencyBalances([swapInfo.tokenIn, swapInfo.tokenOut]);
  const refreshTokenValueRef = useRef<typeof refreshTokenValue>();

  const routeListRef = useRef<TPairRoute[]>();
  const [optimumRouteInfo, setOptimumRouteInfo] = useState<TSwapRouteInfo>();
  useEffect(() => {
    console.log('optimumRouteInfo', optimumRouteInfo);
  }, [optimumRouteInfo]);

  const [isPriceReverse, setIsPriceReverse] = useState(false);
  const resetIsPriceReverse = useCallback(() => {
    setIsPriceReverse(false);
  }, []);

  const executeCb = useCallback(
    async (isRefreshTokenValue = true) => {
      const { tokenIn, tokenOut } = swapInfoRef.current;
      if (!tokenIn || !tokenOut) return;

      try {
        const routeList = await getRouteList({
          startSymbol: tokenIn.symbol,
          endSymbol: tokenOut.symbol,
        });

        if (
          tokenIn.symbol !== swapInfoRef.current.tokenIn?.symbol ||
          tokenOut.symbol !== swapInfoRef.current.tokenOut?.symbol
        ) {
          console.log('executeCb: to exceed the time limit');
          return undefined;
        }
        routeListRef.current = routeList;
        console.log('routeList', routeList);
        isRefreshTokenValue && refreshTokenValueRef.current?.();
        return routeList;
      } catch (error) {
        console.log('executeCb error', error);
      }
      return undefined;
    },
    [getRouteList],
  );
  const executeCbRef = useRef(executeCb);
  executeCbRef.current = executeCb;

  const calculateCb = useReturnLastCallback(
    async ({ tokenIn, tokenOut, valueIn, valueOut, isFocusValueIn }: TSwapInfo, isRefreshRouteList = false) => {
      console.log('calculateCb', isRefreshRouteList);
      let routeList = routeListRef.current;
      if (!routeList || isRefreshRouteList) {
        routeList = await executeCbRef.current(!isRefreshRouteList);
        if (!routeList) return;
      }
      console.log('calculateCb start');

      let winRoute: TSwapRouteInfo | undefined = undefined;
      if (isFocusValueIn) {
        const result = getRouteInfoWithValueIn(routeList, valueIn);
        if (result.length === 0) {
          return {
            valueIn,
            valueOut: '',
          };
        }
        let maxValueOut = ZERO;
        result.forEach((item) => {
          const bigReceive = ZERO.plus(item.valueOut);
          if (bigReceive.gt(maxValueOut)) {
            winRoute = item;
            maxValueOut = bigReceive;
          }
        });
        console.log('winRoute', winRoute);
        return {
          valueIn,
          valueOut: bigNumberToUPString(maxValueOut, tokenOut?.decimals),
          routeInfo: winRoute,
        };
      } else {
        const result = getRouteInfoWithValueOut(routeList, valueOut);
        if (result.length === 0) {
          return {
            valueIn: '',
            valueOut,
          };
        }
        let minValueIn = ZERO.plus(result[0]?.valueIn || 0);
        result.forEach((item) => {
          const bigReceive = ZERO.plus(item.valueIn);
          if (bigReceive.lt(minValueIn)) {
            winRoute = item;
            minValueIn = bigReceive;
          }
        });
        return {
          valueIn: bigNumberToUPString(minValueIn, tokenIn?.decimals),
          valueOut,
          routeInfo: winRoute,
        };
      }
    },
    [],
  );

  const [isInvalidParis, setIsInvalidParis] = useState(false);
  const refreshTokenValue = useCallback(
    async (isRefresh = false) => {
      const { tokenIn, tokenOut, valueIn, valueOut, isFocusValueIn } = swapInfoRef.current;
      if ((isFocusValueIn && valueIn === '') || (!isFocusValueIn && valueOut === '')) {
        setSwapInfo((pre) => ({
          ...pre,
          valueIn: '',
          valueOut: '',
        }));
        setOptimumRouteInfo(undefined);
        return;
      }

      try {
        const result: TCalculateCbResult = await calculateCb(
          {
            tokenIn,
            tokenOut,
            valueIn,
            valueOut,
            isFocusValueIn,
          },
          isRefresh,
        );
        if (!result) return;

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

        if (!result.valueIn || !result.valueOut) {
          setIsInvalidParis(true);
        } else {
          setIsInvalidParis(false);
        }
        setSwapInfo((pre) => ({
          ...pre,
          valueIn: result.valueIn,
          valueOut: result.valueOut,
        }));
        setOptimumRouteInfo(result.routeInfo);
        return result;
      } catch (error) {
        console.log('refreshTokenValue', error);
      }
    },
    [calculateCb],
  );
  refreshTokenValueRef.current = refreshTokenValue;

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
    swapCircleProcessRef.current?.start();
    timerRef.current = setInterval(() => {
      executeCbRef.current();
      swapCircleProcessRef.current?.start();
    }, 30 * 1000);
  }, [clearTimer]);

  const setValueIn = useCallback(
    async (value) => {
      setSwapInfo((pre) => ({
        ...pre,
        valueIn: value,
        valueOut: '',
        isFocusValueIn: true,
      }));
      await sleep(100);
      refreshTokenValue();
    },
    [refreshTokenValue],
  );
  const setValueOut = useCallback(
    async (value) => {
      setSwapInfo((pre) => ({ ...pre, valueOut: value, valueIn: '', isFocusValueIn: false }));
      await sleep(100);
      refreshTokenValue();
    },
    [refreshTokenValue],
  );

  const onTokenChange = useCallback(async () => {
    resetIsPriceReverse();
    setOptimumRouteInfo(undefined);
    await sleep(100);
    registerTimer();
  }, [registerTimer, resetIsPriceReverse]);

  const setTokenIn = useCallback(
    async (tokenIn) => {
      setSwapInfo((pre) => ({
        ...pre,
        tokenIn,
        tokenOut: pre.tokenOut?.symbol === tokenIn.symbol ? pre.tokenIn : pre.tokenOut,
        isFocusValueIn: true,
        valueIn: '',
        valueOut: '',
      }));
      onTokenChange();
    },
    [onTokenChange],
  );

  const setTokenOut = useCallback(
    async (tokenOut) => {
      setSwapInfo((pre) => ({
        ...pre,
        tokenOut,
        tokenIn: pre.tokenIn?.symbol === tokenOut.symbol ? pre.tokenOut : pre.tokenIn,
        isFocusValueIn: true,
        valueOut: '',
      }));
      onTokenChange();
    },
    [onTokenChange],
  );

  const switchToken = useCallback(async () => {
    setSwapInfo((pre) => ({
      ...pre,
      tokenIn: pre.tokenOut,
      tokenOut: pre.tokenIn,
      isFocusValueIn: true,
      valueOut: '',
      valueIn: '',
    }));
    onTokenChange();
  }, [onTokenChange]);

  const priceLabel = useMemo(() => {
    const { tokenIn, tokenOut, valueIn, valueOut } = swapInfo;
    if (!tokenIn || !tokenOut) return '-';
    // if (!valueIn && !valueOut) return '-';

    if (!isPriceReverse) {
      if (!valueIn || !valueOut) return `1 ${tokenIn.symbol} = - ${tokenOut.symbol}`;

      const _price = bigNumberToUPString(ZERO.plus(valueOut).div(ZERO.plus(valueIn)), tokenOut.decimals);
      return `1 ${tokenIn.symbol} = ${_price} ${tokenOut.symbol}`;
    } else {
      if (!valueIn || !valueOut) return `1 ${tokenOut.symbol} = - ${tokenIn.symbol}`;

      const _price = bigNumberToUPString(ZERO.plus(valueIn).div(ZERO.plus(valueOut)), tokenIn.decimals);
      return `1 ${tokenOut.symbol} = ${_price} ${tokenIn.symbol}`;
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
  const amountOutMinValue = useMemo(() => {
    const { valueOut, tokenOut } = swapInfo;
    if (!valueOut || !tokenOut) return '-';
    const _value = bigNumberToString(minimumAmountOut(ZERO.plus(valueOut), userSlippageTolerance), tokenOut.decimals);
    return `${_value} ${tokenOut.symbol}`;
  }, [swapInfo, userSlippageTolerance]);

  const priceImpact = useMemo(() => {
    if (!optimumRouteInfo) return '-';
    const impactList = optimumRouteInfo.recordList.map((item) => {
      return getPriceImpactWithBuy(
        ZERO.plus(item.tokenOutReserve),
        ZERO.plus(item.tokenInReserve),
        item.valueIn,
        ZERO.plus(item.valueOut),
      ).toFixed();
    });

    return `${bigNumberToString(BigNumber.max(...impactList), 2)}%`;
  }, [optimumRouteInfo]);

  const swapFeeValue = useMemo(() => {
    const { tokenIn, valueIn } = swapInfo;
    if (!optimumRouteInfo || !tokenIn || !valueIn) return '-';
    const pathLength = optimumRouteInfo.route.path.length;
    const feeRate = optimumRouteInfo.route.feeRate;

    return `${ZERO.plus(valueIn)
      .times(ONE.minus(ONE.minus(feeRate).pow(pathLength)))
      .dp(tokenIn.decimals)
      .toFixed()} ${tokenIn.symbol}`;
  }, [optimumRouteInfo, swapInfo]);

  const gasFeeValue = useMemo(() => {
    return divDecimals(ZERO.plus(gasFee), 8);
  }, [gasFee]);

  const currencyLogoTokens = useMemo(() => {
    const { tokenIn, tokenOut } = swapInfo;
    return [tokenIn, tokenOut].filter((item) => !!item) as Currency[];
  }, [swapInfo]);

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

  const { loginState } = useWebLogin();
  const swapBtnInfo = useMemo<{
    active?: boolean;
    label: string;
    className?: string;
    fontColor?: FontColor;
    type?: 'primary';
  }>(() => {
    if (loginState !== WebLoginState.logined) return { label: 'Connect Wallet', fontColor: 'primary', active: true };
    const { tokenIn, tokenOut, isFocusValueIn, valueIn } = swapInfo;
    if (!tokenIn || !tokenOut) return { label: 'Select a token', fontColor: 'two' };
    if (isFocusValueIn && !valueIn) return { label: 'Enter an amount', fontColor: 'two' };
    if (isInvalidParis) return { label: 'Insufficient liquidity for this trade', className: 'swap-btn-error' };
    if (isExceedBalance) return { label: `Insufficient ${tokenIn?.symbol} balance`, className: 'swap-btn-error' };
    return {
      active: true,
      className: 'swap-btn-active',
      label: 'Swap',
      type: 'primary',
    };
  }, [isExceedBalance, isInvalidParis, loginState, swapInfo]);

  const routeContract = useRouterContract(SupportedSwapRateMap[optimumRouteInfo?.route?.feeRate || '']);
  const { account } = useActiveWeb3React();
  const tokenInAddress = useMemo(() => getCurrencyAddress(swapInfo.tokenIn), [swapInfo.tokenIn]);
  const { approve, checkAllowance } = useAllowanceAndApprove(
    ChainConstants.constants.TOKEN_CONTRACT,
    tokenInAddress,
    account || undefined,
    routeContract?.address,
  );
  const [isSwapping, setIsSwapping] = useState(false);
  const onSwapClick = useCallback(async () => {
    const { tokenIn, tokenOut, valueIn, valueOut } = swapInfo;
    if (!optimumRouteInfo || !tokenIn || !tokenOut || !valueIn || !valueOut) return;

    const { route } = optimumRouteInfo;
    const routeSymbolIn = route.rawPath?.[0]?.symbol;
    const routeSymbolOut = route.rawPath?.[route.rawPath?.length - 1]?.symbol;
    if (tokenIn.symbol !== routeSymbolIn || tokenOut.symbol !== routeSymbolOut) return;

    const _refreshTokenValue = refreshTokenValueRef.current;
    if (!_refreshTokenValue || !routeContract) return;
    setIsSwapping(true);
    try {
      const result = await _refreshTokenValue(true);
      if (!result || !result.routeInfo) return;

      const originPath = route.rawPath.map((item) => item.symbol);
      const path = result.routeInfo.route.rawPath.map((item) => item.symbol);
      const originFeeRate = result.routeInfo.route.feeRate;
      const feeRate = result.routeInfo.route.feeRate;
      if (path.join('_') !== originPath.join('_') || feeRate !== originFeeRate) {
        // TODO: 200 add invalid warning
        console.log('⭐️⭐️⭐️⭐️⭐️⭐️');
        return;
      }

      const valueInAmountBN = timesDecimals(valueIn, tokenIn.decimals);
      const valueInAmount = valueInAmountBN.toFixed();
      const allowance = await checkAllowance();
      if (valueInAmountBN.gt(allowance)) {
        await approve(valueInAmountBN);
      }

      console.log('valueInAmount', valueInAmount, path, routeContract.address);
      const amountResult = await getContractAmountOut(routeContract, valueInAmount, path);
      const amountOutAmount: string | undefined = amountResult?.amount?.[amountResult?.amount?.length - 1];
      if (!amountOutAmount) return;

      console.log('amountOutAmount', amountOutAmount);
      const amountOutAmountBN = ZERO.plus(amountOutAmount);
      const amountMinOutAmountBN = minimumAmountOut(amountOutAmountBN, userSlippageTolerance);

      console.log('onSwap', {
        account,
        routerContract: routeContract,
        path,
        amountIn: valueInAmountBN,
        amountOutMin: amountMinOutAmountBN,
      });

      const req = await onSwap({
        account,
        routerContract: routeContract,
        path,
        amountIn: valueInAmountBN,
        amountOutMin: amountMinOutAmountBN,
        t,
      });
      if (req !== REQ_CODE.UserDenied) {
        setSwapInfo((pre) => ({
          ...pre,
          valueIn: '',
          valueOut: '',
        }));
        setOptimumRouteInfo(undefined);
        registerTimer();
      }
    } catch (error) {
      //
      console.log('error', error);
    } finally {
      console.log('onSwap finally');
      setIsSwapping(false);
    }

    console.log('routeContract', routeContract);
  }, [
    account,
    approve,
    checkAllowance,
    optimumRouteInfo,
    registerTimer,
    routeContract,
    swapInfo,
    t,
    userSlippageTolerance,
  ]);

  return (
    <div className="swap-page">
      <div className="swap-box">
        <div className="swap-box-header">
          <Font size={20} lineHeight={24}>
            Swap
          </Font>
          <SettingFee />
        </div>
        <div className="swap-box-content">
          <SwapInputRow
            value={swapInfo.valueIn}
            onChange={setValueIn}
            balance={currencyBalances?.[getCurrencyAddress(swapInfo.tokenIn)]}
            token={swapInfo.tokenIn}
            showMax={true}
            gasFee={gasFee}
            suffix={<SwapSelectTokenButton size="middle" token={swapInfo.tokenIn} setToken={setTokenIn} />}
          />
          <div className="swap-token-switch-wrap">
            <div className="swap-token-switch-btn" onClick={switchToken}>
              <IconSwapDefault className="swap-token-switch-btn-default" />
              <IconSwapHover className="swap-token-switch-btn-hover" />
            </div>
          </div>
          <SwapInputRow
            value={swapInfo.valueOut}
            onChange={setValueOut}
            balance={currencyBalances?.[getCurrencyAddress(swapInfo.tokenOut)]}
            token={swapInfo.tokenOut}
            suffix={<SwapSelectTokenButton size="middle" token={swapInfo.tokenOut} setToken={setTokenOut} />}
          />

          <AuthBtn
            loading={isSwapping}
            type={swapBtnInfo.type}
            size="large"
            className={clsx('swap-btn', swapBtnInfo.className)}
            onClick={onSwapClick}
            disabled={!swapBtnInfo.active}>
            <Font size={16} color={swapBtnInfo.fontColor}>
              {swapBtnInfo.label}
            </Font>
          </AuthBtn>

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

                  <SwapCircleProcess ref={swapCircleProcessRef} />
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
                      Max. Slippage
                    </Font>

                    <CommonTooltip
                      placement="top"
                      title={'1'}
                      getPopupContainer={(v) => v}
                      buttonTitle={t('ok')}
                      headerDesc={'2'}
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

                {optimumRouteInfo && (
                  <>
                    <Row align={'middle'} justify={'space-between'}>
                      <Col className="swap-detail-title">
                        <Font color="two" size={14} lineHeight={22}>
                          Min. Received
                        </Font>

                        <CommonTooltip
                          placement="top"
                          title={'1'}
                          getPopupContainer={(v) => v}
                          buttonTitle={t('ok')}
                          headerDesc={'2'}
                        />
                      </Col>

                      <Col>
                        <Font size={14} lineHeight={22}>
                          {amountOutMinValue}
                        </Font>
                      </Col>
                    </Row>

                    <Row align={'middle'} justify={'space-between'}>
                      <Col className="swap-detail-title">
                        <Font color="two" size={14} lineHeight={22}>
                          Price Impact
                        </Font>

                        <CommonTooltip
                          placement="top"
                          title={'1'}
                          getPopupContainer={(v) => v}
                          buttonTitle={t('ok')}
                          headerDesc={'2'}
                        />
                      </Col>

                      <Col>
                        <Font size={14} lineHeight={22}>
                          {priceImpact}
                        </Font>
                      </Col>
                    </Row>

                    <Row align={'middle'} justify={'space-between'}>
                      <Col className="swap-detail-title">
                        <Font color="two" size={14} lineHeight={22}>
                          Swap Fee
                        </Font>

                        <CommonTooltip
                          placement="top"
                          title={'1'}
                          getPopupContainer={(v) => v}
                          buttonTitle={t('ok')}
                          headerDesc={'2'}
                        />
                      </Col>

                      <Col>
                        <Font size={14} lineHeight={22}>
                          {swapFeeValue}
                        </Font>
                      </Col>
                    </Row>

                    <Row align={'middle'} justify={'space-between'}>
                      <Col className="swap-detail-title">
                        <Font color="two" size={14} lineHeight={22}>
                          Network Cost
                        </Font>

                        <CommonTooltip
                          placement="top"
                          title={'1'}
                          getPopupContainer={(v) => v}
                          buttonTitle={t('ok')}
                          headerDesc={'2'}
                        />
                      </Col>

                      <Col>
                        <Font size={14} lineHeight={22}>
                          {`${gasFeeValue} ELF`}
                        </Font>
                      </Col>
                    </Row>

                    <Row align={'middle'} justify={'space-between'}>
                      <Col className="swap-detail-title">
                        <Font color="two" size={14} lineHeight={22}>
                          Order Routing
                        </Font>

                        <CommonTooltip
                          placement="top"
                          title={'1'}
                          getPopupContainer={(v) => v}
                          buttonTitle={t('ok')}
                          headerDesc={'2'}
                        />
                      </Col>

                      <Col className="swap-order-routing-tip-wrap">
                        <CommonTooltip
                          placement="right"
                          title={<SwapOrderRouting route={optimumRouteInfo?.route} />}
                          getPopupContainer={(v) => v}
                          buttonTitle={t('ok')}
                          headerDesc={'2'}>
                          <CurrencyLogos size={20} tokens={currencyLogoTokens} isSortToken={false} />
                        </CommonTooltip>
                      </Col>
                    </Row>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
