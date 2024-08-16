import { useTranslation } from 'react-i18next';

import './styles.less';
import { ILimitPairPrice, LimitPairPrice, TLimitPairPriceError } from '../LimitPairPrice';
import SwapInputRow from '../SwapInputRow';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Currency } from '@awaken/sdk-core';
import { ChainConstants } from 'constants/ChainConstants';
import { useCurrencyBalancesV2 } from 'hooks/useBalances';
import { useTransactionFee } from 'contexts/useStore/hooks';
import SwapSelectTokenButton from '../SwapSelectTokenButton';
import { getCurrencyAddress } from 'utils/swap';
import { IconSwapDefault, IconSwapHover } from 'assets/icons';
import { usePairMaxReserve } from 'hooks/limit';
import { ZERO } from 'constants/misc';
import BigNumber from 'bignumber.js';
import AuthBtn from 'Buttons/AuthBtn';
import clsx from 'clsx';
import Font from 'components/Font';
import { FontColor } from 'utils/getFontStyle';
import { useIsConnected } from 'hooks/useLogin';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import { divDecimals } from 'utils/calculate';
import { formatSymbol } from 'utils/token';
import { useModalDispatch } from 'contexts/useModal/hooks';
import { basicModalView } from 'contexts/useModal/actions';
import { useGetLimitOrderRemainingUnfilled } from 'graphqlServer/hooks';
import { DEFAULT_CHAIN } from 'constants/index';
import { useActiveWeb3React } from 'hooks/web3';
import { LimitConfirmModal, LimitConfirmModalInterface } from 'Modals/LimitConfirmModal';
import {
  ExpiryEnum,
  LimitExpiry,
} from 'pages/Exchange/components/ExchangeContainer/components/LimitCard/components/LimitExpiry';
import { Col, Row } from 'antd';

import TransactionFee from 'pages/Exchange/components/ExchangeContainer/components/ExchangeCard/components/TransactionFee';
import { LimitTips } from '../LimitTips';
import { LimitFee } from '../LimitFee';

export type TLimitInfo = {
  tokenIn?: Currency;
  tokenOut?: Currency;

  valueIn: string;
  valueOut: string;
  isFocusValueIn: boolean;
};

type TPriceInfo = {
  price: string;
  isReverse: boolean;
};

export const LimitPanel = () => {
  const { t } = useTranslation();
  const gasFee = useTransactionFee();
  const limitPairPriceRef = useRef<ILimitPairPrice>();

  const [limitInfo, setLimitInfo] = useState<TLimitInfo>({
    tokenIn: ChainConstants.constants.COMMON_BASES[2],
    tokenOut: ChainConstants.constants.COMMON_BASES[0],

    valueIn: '',
    valueOut: '',
    isFocusValueIn: true,
  });
  const [tokenPriceInfo, setTokenPriceInfo] = useState<TPriceInfo>({
    price: '0',
    isReverse: false,
  });
  const currencyBalances = useCurrencyBalancesV2([limitInfo.tokenIn, limitInfo.tokenOut]);
  const {
    maxReserve,
    isError: isReserveError,
    refresh: refreshReserve,
  } = usePairMaxReserve(limitInfo.tokenIn?.symbol, limitInfo.tokenOut?.symbol);
  const [expiryValue, setExpiryValue] = useState(ExpiryEnum.day);

  const setValueIn = useCallback(
    async (value: string, _tokenOutPrice?: TPriceInfo) => {
      const { price, isReverse } = _tokenOutPrice ?? tokenPriceInfo;
      if (ZERO.gte(price) || !price) {
        setLimitInfo((pre) => ({
          ...pre,
          valueOut: '',
        }));
        return;
      }

      setLimitInfo((pre) => {
        let _valueOut = '';
        if (value) {
          if (!isReverse) {
            _valueOut = ZERO.plus(value)
              .div(price)
              .dp(pre.tokenOut?.decimals || 0, BigNumber.ROUND_CEIL)
              .toFixed();
          } else {
            _valueOut = ZERO.plus(value)
              .times(price)
              .dp(pre.tokenOut?.decimals || 0, BigNumber.ROUND_FLOOR)
              .toFixed();
          }
        }

        return {
          ...pre,
          valueIn: value,
          isFocusValueIn: true,
          valueOut: _valueOut,
        };
      });
    },
    [tokenPriceInfo],
  );

  const setValueOut = useCallback(
    async (value: string, _tokenOutPrice?: TPriceInfo) => {
      const { price, isReverse } = _tokenOutPrice ?? tokenPriceInfo;
      if (ZERO.gte(price) || !price) {
        setLimitInfo((pre) => ({
          ...pre,
          valueIn: '',
        }));
        return;
      }

      setLimitInfo((pre) => {
        let _valueIn = '';
        if (value) {
          if (!isReverse) {
            _valueIn = ZERO.plus(value)
              .times(price)
              .dp(pre.tokenIn?.decimals || 0, BigNumber.ROUND_FLOOR)
              .toFixed();
          } else {
            _valueIn = ZERO.plus(value)
              .div(price)
              .dp(pre.tokenIn?.decimals || 0, BigNumber.ROUND_CEIL)
              .toFixed();
          }
        }

        return {
          ...pre,
          valueOut: value,
          isFocusValueIn: false,
          valueIn: _valueIn,
        };
      });
    },
    [tokenPriceInfo],
  );

  const setTokenIn = useCallback(async (tokenIn?: Currency) => {
    if (!tokenIn) return;
    limitPairPriceRef.current?.reset();
    setLimitInfo((pre) => {
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
  }, []);

  const setTokenOut = useCallback(async (tokenOut?: Currency) => {
    if (!tokenOut) return;
    limitPairPriceRef.current?.reset();
    setLimitInfo((pre) => {
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
  }, []);

  const switchToken = useCallback(async () => {
    limitPairPriceRef.current?.reset();
    setLimitInfo((pre) => ({
      ...pre,
      tokenIn: pre.tokenOut,
      tokenOut: pre.tokenIn,
      isFocusValueIn: !pre.isFocusValueIn,
      valueOut: pre.isFocusValueIn ? pre.valueIn : '',
      valueIn: pre.isFocusValueIn ? '' : pre.valueOut,
    }));
  }, []);

  const refreshValue = useCallback(
    (price: string, isReverse: boolean) => {
      if (limitInfo.isFocusValueIn) {
        setValueIn(limitInfo.valueIn, {
          price,
          isReverse,
        });
      } else {
        setValueOut(limitInfo.valueOut, {
          price,
          isReverse,
        });
      }
    },
    [limitInfo.isFocusValueIn, limitInfo.valueIn, limitInfo.valueOut, setValueIn, setValueOut],
  );
  const refreshValueRef = useRef(refreshValue);
  refreshValueRef.current = refreshValue;
  const onPairPriceChange = useCallback((value: string, isReverse: boolean) => {
    setTokenPriceInfo({
      price: value,
      isReverse,
    });
    refreshValueRef.current(value, isReverse);
  }, []);

  const isExceedBalance = useMemo(() => {
    const { tokenIn, valueIn } = limitInfo;
    if (!tokenIn) return false;
    const tokenInBalance = currencyBalances?.[getCurrencyAddress(limitInfo.tokenIn)];
    if (tokenInBalance === undefined) return true;
    const validBalance = tokenIn.symbol === 'ELF' ? ZERO.plus(tokenInBalance).minus(gasFee) : tokenInBalance;
    if (ZERO.plus(valueIn).gt(divDecimals(validBalance, tokenIn.decimals))) return true;
    return false;
  }, [currencyBalances, gasFee, limitInfo]);
  const { isLocking } = useConnectWallet();
  const isConnected = useIsConnected();
  const [pairPriceError, setPairPriceError] = useState<TLimitPairPriceError>({
    text: '',
    error: false,
  });
  const swapBtnInfo = useMemo<{
    active?: boolean;
    label: string;
    className?: string;
    fontColor?: FontColor;
    type?: 'primary';
  }>(() => {
    if (!isConnected) return { label: t(isLocking ? 'Unlock' : 'connectWallet'), fontColor: 'primary', active: true };
    const { tokenIn, tokenOut, isFocusValueIn, valueIn, valueOut } = limitInfo;
    if (!tokenIn || !tokenOut) return { label: t('selectAToken'), fontColor: 'two' };
    if (isReserveError) return { label: t('Go To Create'), active: true, type: 'primary' };
    if (!tokenPriceInfo.price || ZERO.eq(tokenPriceInfo.price) || pairPriceError.error)
      return { label: t('Enter an price'), fontColor: 'two' };
    if (isFocusValueIn && (!valueIn || ZERO.eq(valueIn))) return { label: t('Enter an amount'), fontColor: 'two' };
    if (!isFocusValueIn && (!valueOut || ZERO.eq(valueOut))) return { label: t('Enter an amount'), fontColor: 'two' };

    if (isExceedBalance)
      return {
        label: t(`insufficientBalance`, { symbol: formatSymbol(tokenIn?.symbol) }),
        className: 'swap-btn-error',
      };
    return {
      active: true,
      className: 'swap-btn-active',
      label: t('Submit Order'),
      type: 'primary',
    };
  }, [
    isConnected,
    isExceedBalance,
    isLocking,
    isReserveError,
    limitInfo,
    pairPriceError.error,
    t,
    tokenPriceInfo.price,
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const modalDispatch = useModalDispatch();
  const getUnfilled = useGetLimitOrderRemainingUnfilled();
  const { account } = useActiveWeb3React();
  const limitConfirmModalRef = useRef<LimitConfirmModalInterface>();
  const onSwapClick = useCallback(async () => {
    const { tokenIn, tokenOut, valueIn, valueOut } = limitInfo;
    if (!tokenIn || !tokenOut) return;

    if (isReserveError) {
      modalDispatch(
        basicModalView.setSwapNotSupported.actions({
          tokenIn,
          tokenOut,
        }),
      );
      return;
    }

    if (ZERO.gte(valueIn || 0) || ZERO.gte(valueOut || 0)) return;
    setIsLoading(true);
    try {
      const result = await getUnfilled({
        dto: {
          chainId: DEFAULT_CHAIN,
          makerAddress: account,
          tokenSymbol: tokenIn.symbol,
        },
      });
      limitConfirmModalRef.current?.show({
        tokenIn,
        tokenOut,
        amountIn: valueIn,
        amountOut: valueOut,
        expiryValue,
        isPriceReverse: tokenPriceInfo.isReverse,
        unfilledValue: result.data.limitOrderRemainingUnfilled.value,
      });
    } catch (error) {
      console.log('LimitSellBtnWithPay error', error);
    } finally {
      setIsLoading(false);
    }
  }, [account, expiryValue, getUnfilled, isReserveError, limitInfo, modalDispatch, tokenPriceInfo.isReverse]);

  const onTradeSuccess = useCallback(() => {
    setLimitInfo((pre) => ({
      ...pre,
      valueIn: '',
      valueOut: '',
    }));
    refreshReserve();
  }, [refreshReserve]);

  const onPriceError = useCallback(() => {
    refreshReserve();
  }, [refreshReserve]);

  return (
    <div className="limit-panel">
      <LimitPairPrice
        ref={limitPairPriceRef}
        tokenIn={limitInfo.tokenIn}
        tokenOut={limitInfo.tokenOut}
        reserve={maxReserve}
        onChange={onPairPriceChange}
        onErrorChange={setPairPriceError}
      />

      <SwapInputRow
        title={t('Pay')}
        value={limitInfo.valueIn}
        onChange={setValueIn}
        balance={currencyBalances?.[getCurrencyAddress(limitInfo.tokenIn)]}
        token={limitInfo.tokenIn}
        showMax={true}
        gasFee={gasFee}
        suffix={
          <SwapSelectTokenButton
            className="swap-select-token-btn"
            type="default"
            size="middle"
            token={limitInfo.tokenIn}
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
        value={limitInfo.valueOut}
        onChange={setValueOut}
        balance={currencyBalances?.[getCurrencyAddress(limitInfo.tokenOut)]}
        token={limitInfo.tokenOut}
        suffix={
          <SwapSelectTokenButton
            className="swap-select-token-btn"
            type="default"
            size="middle"
            token={limitInfo.tokenOut}
            setToken={setTokenOut}
          />
        }
      />

      <div className="swap-btn-wrap">
        <AuthBtn
          type={swapBtnInfo.type}
          size="large"
          className={clsx('swap-btn', swapBtnInfo.className)}
          onClick={onSwapClick}
          loading={isLoading}
          disabled={!swapBtnInfo.active}>
          <Font size={16} color={swapBtnInfo.fontColor}>
            {swapBtnInfo.label}
          </Font>
        </AuthBtn>
      </div>

      <Row gutter={[0, 12]}>
        <Col span={24}>
          <LimitExpiry value={expiryValue} onChange={setExpiryValue} />
        </Col>
        <Col span={24}>
          <LimitFee />
        </Col>
        <Col span={24}>
          <TransactionFee lineHeight={22} />
        </Col>
        <Col span={24}>
          <LimitTips />
        </Col>
      </Row>

      <LimitConfirmModal ref={limitConfirmModalRef} onSuccess={onTradeSuccess} onPriceError={onPriceError} />
    </div>
  );
};
