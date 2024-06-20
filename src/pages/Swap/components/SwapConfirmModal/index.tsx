import Font from 'components/Font';
import { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatSymbol } from 'utils/token';
import { Col, Row } from 'antd';
import CommonModal from 'components/CommonModal';
import CommonButton from 'components/CommonButton';
import { TSwapInfo } from '../SwapPanel';
import { TSwapRouteInfo } from 'pages/Swap/types';
import { CurrencyLogo } from 'components/CurrencyLogo';
import { REQ_CODE, SWAP_TIME_INTERVAL, ZERO } from 'constants/misc';
import { SwapRouteInfo } from '../SwapRouteInfo';
import { useUserSettings } from 'contexts/useUserSettings';
import { getCurrencyAddress, minimumAmountOut, parseUserSlippageTolerance } from 'utils/swap';
import './styles.less';
import { useRouterContract } from 'hooks/useContract';
import { SupportedSwapRateMap } from 'constants/swap';
import { getContractAmountOut } from 'pages/Swap/utils';
import { useReturnLastCallback } from 'hooks';
import { divDecimals, timesDecimals } from 'utils/calculate';
import { useActiveWeb3React } from 'hooks/web3';
import useAllowanceAndApprove from 'hooks/useApprove';
import { ChainConstants } from 'constants/ChainConstants';
import { onSwap } from 'utils/swapContract';
import notification from 'utils/notificationNew';

export type TSwapConfirmModalProps = {
  onSuccess?: () => void;
  gasFee: string | 0;
  tokenInPrice: string;
  tokenOutPrice: string;
};

export interface SwapConfirmModalInterface {
  show: (params: { swapInfo: TSwapInfo; routeInfo: TSwapRouteInfo; priceLabel: string }) => void;
}

export const SwapConfirmModal = forwardRef(
  ({ tokenInPrice, tokenOutPrice, gasFee, onSuccess }: TSwapConfirmModalProps, ref) => {
    const { t } = useTranslation();

    const [isVisible, setIsVisible] = useState(false);
    const [swapInfo, setSwapInfo] = useState<TSwapInfo>();
    const [routeInfo, setRouteInfo] = useState<TSwapRouteInfo>();
    const [priceLabel, setPriceLabel] = useState('');

    const [{ userSlippageTolerance }] = useUserSettings();
    const slippageValue = useMemo(() => {
      return ZERO.plus(parseUserSlippageTolerance(userSlippageTolerance)).dp(2).toString();
    }, [userSlippageTolerance]);

    const priceIn = useMemo(
      () =>
        ZERO.plus(swapInfo?.valueIn || 0)
          .times(tokenInPrice)
          .dp(2)
          .toFixed(),
      [swapInfo?.valueIn, tokenInPrice],
    );

    const priceOut = useMemo(
      () =>
        ZERO.plus(swapInfo?.valueOut || 0)
          .times(tokenOutPrice)
          .dp(2)
          .toFixed(),
      [swapInfo?.valueOut, tokenOutPrice],
    );

    const getValueOut = useReturnLastCallback(getContractAmountOut, []);

    const routeContract = useRouterContract(SupportedSwapRateMap[routeInfo?.route?.feeRate || '']);

    const executeCb = useCallback(async () => {
      if (!swapInfo || !routeInfo || !routeContract) return;
      const { tokenIn, tokenOut, valueIn } = swapInfo;
      if (!tokenIn || !tokenOut) return;
      const valueInAmountBN = timesDecimals(valueIn, tokenIn.decimals);
      const valueInAmount = valueInAmountBN.toFixed();
      const path = routeInfo.route.rawPath.map((item) => item.symbol);
      try {
        const amountResult = await getValueOut(routeContract, valueInAmount, path);
        const amountOutAmount: string | undefined = amountResult?.amount?.[amountResult?.amount?.length - 1];
        if (!amountOutAmount) return;
        const amountOutValue = divDecimals(amountOutAmount, tokenOut.decimals).toFixed();

        console.log('SwapConfirmModal amountOutValue', amountOutValue);
        setSwapInfo((pre) => {
          if (!pre) return pre;
          return {
            ...pre,
            valueOut: amountOutValue,
          };
        });

        return {
          value: amountOutValue,
          amount: amountOutAmount,
        };
      } catch (error) {
        console.log('SwapConfirmModal executeCb error:', error);
        return;
      }
    }, [getValueOut, routeContract, routeInfo, swapInfo]);
    const executeCbRef = useRef(executeCb);
    executeCbRef.current = executeCb;

    const timerRef = useRef<NodeJS.Timeout>();
    const clearTimer = useCallback(() => {
      if (!timerRef.current) return;
      clearInterval(timerRef.current);
      console.log('SwapConfirmModal: clearTimer');
    }, []);

    const registerTimer = useCallback(() => {
      clearTimer();
      console.log('SwapConfirmModal: registerTimer');

      executeCbRef.current();
      timerRef.current = setInterval(() => {
        executeCbRef.current();
      }, SWAP_TIME_INTERVAL);
    }, [clearTimer]);

    const show = useCallback<SwapConfirmModalInterface['show']>(
      ({ swapInfo, routeInfo, priceLabel }) => {
        setSwapInfo(JSON.parse(JSON.stringify(swapInfo)));
        setRouteInfo(JSON.parse(JSON.stringify(routeInfo)));
        setPriceLabel(priceLabel);
        registerTimer();
        setIsVisible(true);
      },
      [registerTimer],
    );
    useImperativeHandle(ref, () => ({ show }));

    const onCancel = useCallback(() => {
      setIsVisible(false);
      setSwapInfo(undefined);
      setRouteInfo(undefined);
      setPriceLabel('');
      clearTimer();
    }, [clearTimer]);

    const [isSwapping, setIsSwapping] = useState(false);
    const { account } = useActiveWeb3React();
    const tokenInAddress = useMemo(() => getCurrencyAddress(swapInfo?.tokenIn), [swapInfo?.tokenIn]);
    const { approve, checkAllowance } = useAllowanceAndApprove(
      ChainConstants.constants.TOKEN_CONTRACT,
      tokenInAddress,
      account || undefined,
      routeContract?.address,
    );
    const onConfirmClick = useCallback(async () => {
      if (!swapInfo || !routeInfo || !routeContract) return;
      const { tokenIn, tokenOut, valueIn, valueOut } = swapInfo;
      if (!tokenIn || !tokenOut || !valueIn || !valueOut) return;

      const { route } = routeInfo;
      const routeSymbolIn = route.rawPath?.[0]?.symbol;
      const routeSymbolOut = route.rawPath?.[route.rawPath?.length - 1]?.symbol;
      if (tokenIn.symbol !== routeSymbolIn || tokenOut.symbol !== routeSymbolOut) return;

      setIsSwapping(true);
      try {
        const valueInAmountBN = timesDecimals(valueIn, tokenIn.decimals);
        const valueOutAmountBN = timesDecimals(valueOut, tokenOut.decimals);
        const valueInAmount = valueInAmountBN.toFixed();
        const allowance = await checkAllowance();
        if (valueInAmountBN.gt(allowance)) {
          await approve(valueInAmountBN);
        }
        const path = route.rawPath.map((item) => item.symbol);
        console.log('SwapConfirmModal: valueInAmount', valueInAmount, path, routeContract.address);

        const amountResult = await executeCbRef.current();
        if (!amountResult) return;
        const amountOutAmount = amountResult.amount;

        console.log('SwapConfirmModal: amountOutAmount', amountOutAmount);
        const amountMinOutAmountBN = minimumAmountOut(valueOutAmountBN, userSlippageTolerance);

        if (amountMinOutAmountBN.gt(amountOutAmount)) {
          notification.warning({
            message: t('Warning'),
            description: t('The price has changed, please re-initiate the transaction'),
          });
          return;
        }

        console.log('onSwap', {
          account,
          routerContract: routeContract,
          path,
          amountIn: valueInAmountBN,
          amountOutMin: amountMinOutAmountBN,
          tokenB: tokenIn,
          tokenA: tokenOut,
        });

        const req = await onSwap({
          account,
          routerContract: routeContract,
          path,
          amountIn: valueInAmountBN,
          amountOutMin: amountMinOutAmountBN,
          tokenB: tokenIn,
          tokenA: tokenOut,
          t,
        });
        if (req !== REQ_CODE.UserDenied) {
          onSuccess?.();
          onCancel();
          return true;
        }
      } catch (error) {
        console.log('SwapConfirmModal onSwap error', error);
      } finally {
        console.log('onSwap finally');
        setIsSwapping(false);
      }
    }, [
      account,
      approve,
      checkAllowance,
      onCancel,
      onSuccess,
      routeContract,
      routeInfo,
      swapInfo,
      t,
      userSlippageTolerance,
    ]);

    return (
      <CommonModal
        width="420px"
        height="522px"
        showType="modal"
        showBackIcon={false}
        closable={true}
        centered={true}
        visible={isVisible}
        title={t('Review Swap')}
        className={'swap-confirm-modal'}
        onCancel={onCancel}>
        <div className="swap-confirm-modal-content">
          <div className="swap-confirm-modal-input-wrap">
            <div className="swap-confirm-modal-input-info">
              <Font size={14} lineHeight={22} color="two">
                {t('Pay')}
              </Font>
              <Font size={24} lineHeight={32}>{`${swapInfo?.valueIn} ${formatSymbol(swapInfo?.tokenIn?.symbol)}`}</Font>
              <Font size={14} lineHeight={22} color="two">
                {`$${priceIn}`}
              </Font>
            </div>
            <CurrencyLogo size={36} currency={swapInfo?.tokenIn} />
          </div>
          <div className="swap-confirm-modal-input-wrap">
            <div className="swap-confirm-modal-input-info">
              <Font size={14} lineHeight={22} color="two">
                {t('Receive')}
              </Font>
              <Font size={24} lineHeight={32}>{`${swapInfo?.valueOut} ${formatSymbol(
                swapInfo?.tokenOut?.symbol,
              )}`}</Font>
              <Font size={14} lineHeight={22} color="two">
                {`$${priceOut}`}
              </Font>
            </div>
            <CurrencyLogo size={36} currency={swapInfo?.tokenOut} />
          </div>

          <div className="swap-confirm-modal-detail">
            <Row align={'middle'} justify={'space-between'}>
              <Col className="swap-detail-title">
                <Font color="two" size={14} lineHeight={22}>
                  {t('price')}
                </Font>
              </Col>

              <Row gutter={[4, 0]} align="middle">
                <Col>
                  <Font size={14} lineHeight={22}>
                    {priceLabel}
                  </Font>
                </Col>
              </Row>
            </Row>

            <Row align={'middle'} justify={'space-between'}>
              <Col className="swap-detail-title">
                <Font color="two" size={14} lineHeight={22}>
                  {t('slippageTolerance')}
                </Font>
              </Col>

              <Row gutter={[4, 0]} align="middle">
                <Col>
                  <Font size={14} lineHeight={22} suffix="%">
                    {slippageValue}
                  </Font>
                </Col>
              </Row>
            </Row>

            {routeInfo && swapInfo && (
              <SwapRouteInfo
                isTipShow={false}
                isRoutingShow={false}
                swapInfo={swapInfo}
                routeInfo={routeInfo}
                gasFee={gasFee}
              />
            )}
          </div>
        </div>
        <CommonButton onClick={onConfirmClick} loading={isSwapping} className="swap-confirm-modal-btn" type="primary">
          {t('Confirm Swap')}
        </CommonButton>
      </CommonModal>
    );
  },
);
