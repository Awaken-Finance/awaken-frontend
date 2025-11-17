import Font from 'components/Font';
import { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatSymbol } from 'utils/token';
import { Col, Row } from 'antd';
import CommonModal from 'components/CommonModal';
import CommonButton from 'components/CommonButton';
import { TSwapInfo } from '../SwapPanel';
import { TContractSwapToken, TSwapRoute } from 'pages/Swap/types';
import { CurrencyLogo } from 'components/CurrencyLogo';
import { ONE, REQ_CODE, SWAP_TIME_INTERVAL, TEN_THOUSAND, ZERO } from 'constants/misc';
import { SwapRouteInfo } from '../SwapRouteInfo';
import { useUserSettings } from 'contexts/useUserSettings';
import { getCurrencyAddress, getDeadline, minimumAmountOut, parseUserSlippageTolerance } from 'utils/swap';
import './styles.less';
import { useAElfContract } from 'hooks/useContract';
import { getContractTotalAmountOut } from 'pages/Swap/utils';
import { useReturnLastCallback } from 'hooks';
import { divDecimals, timesDecimals } from 'utils/calculate';
import { useActiveWeb3React } from 'hooks/web3';
import useAllowanceAndApprove from 'hooks/useApprove';
import { ChainConstants } from 'constants/ChainConstants';
import { onSwap } from 'utils/swapContract';
import notification from 'utils/notificationNew';
import { SWAP_HOOK_CONTRACT_ADDRESS } from 'constants/index';
import { getCID, sleep } from 'utils';
import { SWAP_LABS_FEE_RATE, SWAP_RECEIVE_RATE } from 'constants/swap';
import BigNumber from 'bignumber.js';
import { formatSwapError } from 'utils/formatError';

export type TSwapConfirmModalProps = {
  onSuccess?: () => void;
  gasFee: number;
  tokenInPrice: string;
  tokenOutPrice: string;
};

export interface SwapConfirmModalInterface {
  show: (params: { swapInfo: TSwapInfo; swapRoute: TSwapRoute; priceLabel: string }) => void;
}

export const SwapConfirmModal = forwardRef(
  ({ tokenInPrice, tokenOutPrice, gasFee, onSuccess }: TSwapConfirmModalProps, ref) => {
    const { t } = useTranslation();

    const [isVisible, setIsVisible] = useState(false);
    const [swapInfo, setSwapInfo] = useState<TSwapInfo>();
    const [swapRoute, setSwapRoute] = useState<TSwapRoute>();
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

    const getValueOut = useReturnLastCallback(getContractTotalAmountOut, []);

    const routeContract = useAElfContract(SWAP_HOOK_CONTRACT_ADDRESS);

    const executeCb = useCallback(async () => {
      if (!swapInfo || !swapRoute || !routeContract) return;
      const { tokenOut } = swapInfo;
      if (!tokenOut) return;

      try {
        const { amountOuts, total: amountOutAmount } = await getValueOut({
          contract: routeContract,
          swapRoute,
        });

        console.log('SwapConfirmModal amountOutValue', amountOutAmount);

        const amountOutValue = divDecimals(
          ZERO.plus(amountOutAmount).times(SWAP_RECEIVE_RATE).dp(0, BigNumber.ROUND_CEIL),
          tokenOut.decimals,
        ).toFixed();

        setSwapInfo((pre) => {
          if (!pre) return pre;
          return {
            ...pre,
            valueOut: amountOutValue,
          };
        });
        const _swapRoute: TSwapRoute = JSON.parse(JSON.stringify(swapRoute));
        _swapRoute.distributions.forEach((path, idx) => {
          path.amountOut = amountOuts[idx];
        });
        console.log('_swapRoute', _swapRoute);

        return {
          amountOutValue,
          amountOutAmount,
          swapRoute: _swapRoute,
        };
      } catch (error) {
        console.log('SwapConfirmModal executeCb error:', error);
        return;
      }
    }, [getValueOut, routeContract, swapInfo, swapRoute]);
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
      async ({ swapInfo, swapRoute, priceLabel }) => {
        setSwapInfo(JSON.parse(JSON.stringify(swapInfo)));
        setSwapRoute(JSON.parse(JSON.stringify(swapRoute)));
        setPriceLabel(priceLabel);
        await sleep(100);
        registerTimer();
        setIsVisible(true);
      },
      [registerTimer],
    );
    useImperativeHandle(ref, () => ({ show }));

    const onCancel = useCallback(() => {
      setIsVisible(false);
      setSwapInfo(undefined);
      setSwapRoute(undefined);
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
      if (!swapInfo || !routeContract) return;

      const { tokenIn, tokenOut, valueIn, valueOut } = swapInfo;
      if (!tokenIn || !tokenOut || !valueIn || !valueOut) return;

      setIsSwapping(true);
      try {
        const valueInAmountBN = timesDecimals(valueIn, tokenIn.decimals);
        const allowance = await checkAllowance();
        if (valueInAmountBN.gt(allowance)) {
          await approve(valueInAmountBN);
        }

        const valueOutAmountBN = timesDecimals(valueOut, tokenOut.decimals);

        const result = await executeCbRef.current();
        if (!result) return;
        const swapRoute = result.swapRoute;
        const amountOutAmount = result.amountOutAmount;

        const amountMinOutAmountBN = BigNumber.max(
          minimumAmountOut(valueOutAmountBN, userSlippageTolerance).dp(0, BigNumber.ROUND_DOWN),
          ONE,
        );
        if (amountMinOutAmountBN.gt(amountOutAmount)) {
          notification.warning({
            message: null,
            description: t('The price has changed, please re-initiate the transaction'),
          });
          return;
        }

        const deadline = getDeadline();
        const channel = getCID();
        const swapTokens: TContractSwapToken[] = swapRoute.distributions.map((item) => {
          const amountOutMinBN = BigNumber.max(
            minimumAmountOut(ZERO.plus(item.amountOut), userSlippageTolerance).dp(0, BigNumber.ROUND_DOWN),
            ONE,
          );
          const amountOutMin = amountOutMinBN.lt(1) ? '1' : amountOutMinBN.toFixed();

          return {
            amountIn: item.amountIn,
            amountOutMin,
            channel,
            deadline,
            path: item.tokens.map((token) => token.symbol),
            to: account,
            feeRates: item.feeRates.map((fee) => ZERO.plus(TEN_THOUSAND).times(fee).toNumber()),
          };
        });

        console.log('onSwap', {
          account,
          routerContract: routeContract,
          swapTokens,
          amountIn: valueInAmountBN,
          amountOutMin: amountMinOutAmountBN,
          tokenB: tokenIn,
          tokenA: tokenOut,
        });
        const req = await onSwap({
          account,
          routerContract: routeContract,
          swapArgs: {
            swapTokens,
            labsFeeRate: SWAP_LABS_FEE_RATE,
          },
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
        formatSwapError(error, {
          amount: divDecimals(valueIn, tokenIn.decimals).dp(8).toFixed(),
          symbol: tokenOut?.symbol,
        });
      } finally {
        console.log('onSwap finally');
        setIsSwapping(false);
      }
    }, [account, approve, checkAllowance, onCancel, onSuccess, routeContract, swapInfo, t, userSlippageTolerance]);

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

            {swapRoute && swapInfo && (
              <SwapRouteInfo
                isTipShow={false}
                isRoutingShow={false}
                swapInfo={swapInfo}
                swapRoute={swapRoute}
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
