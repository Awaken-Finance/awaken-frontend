import { useCallback, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import { Currency } from '@awaken/sdk-core';
import { ZERO } from 'constants/misc';
import { useTranslation } from 'react-i18next';
import Font from 'components/Font';
import AuthBtn from 'Buttons/AuthBtn';
import './index.less';
import { formatSymbol } from 'utils/token';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import { useIsConnected } from 'hooks/useLogin';
import { ExpiryEnum } from 'pages/Exchange/components/ExchangeContainer/components/LimitCard/components/LimitExpiry';
import { LimitConfirmModal, LimitConfirmModalInterface } from 'Modals/LimitConfirmModal';
import { useGetLimitOrderRemainingUnfilled } from 'graphqlServer/hooks';
import { DEFAULT_CHAIN } from 'constants/index';
import { useActiveWeb3React } from 'hooks/web3';

interface LimitSellBtnProps {
  sell?: boolean;
  disabled?: boolean;
  tokenIn?: Currency;
  tokenOut?: Currency;
  amountIn?: string;
  amountOut?: string;
  expiryValue: ExpiryEnum;
  onClick?: () => void;
  onTradeSuccess: () => void;
  isFixState?: boolean;
  isPriceReverse?: boolean;
}

export function LimitSellBtnWithPay({
  sell,
  disabled,
  tokenIn,
  tokenOut,
  amountIn = '0',
  amountOut = '0',
  expiryValue,
  onClick,
  onTradeSuccess,
  isFixState = false,
  isPriceReverse = false,
}: LimitSellBtnProps) {
  const limitConfirmModalRef = useRef<LimitConfirmModalInterface>();
  const getUnfilled = useGetLimitOrderRemainingUnfilled();
  const { account } = useActiveWeb3React();

  const buttonDisabled = useMemo(() => {
    return disabled || !tokenIn || !tokenOut || !tokenIn?.symbol || !tokenOut?.symbol;
  }, [disabled, tokenIn, tokenOut]);

  const [isLoading, setIsLoading] = useState(false);
  const handleClick = useCallback(async () => {
    onClick?.();
    if (ZERO.gte(amountIn || 0) || ZERO.gte(amountOut || 0) || !tokenIn || !tokenOut) return;
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
        amountIn,
        amountOut,
        expiryValue,
        isPriceReverse,
        unfilledCount: result.data.limitOrderRemainingUnfilled.orderCount,
        unfilledValue: result.data.limitOrderRemainingUnfilled.value,
      });
    } catch (error) {
      console.log('LimitSellBtnWithPay error', error);
    } finally {
      setIsLoading(false);
    }
  }, [account, amountIn, amountOut, expiryValue, getUnfilled, isPriceReverse, onClick, tokenIn, tokenOut]);

  return (
    <>
      <LimitSellBtn
        sell={sell}
        symbolA={sell ? tokenIn?.symbol : tokenOut?.symbol}
        disabled={buttonDisabled}
        onClick={handleClick}
        loading={isLoading}
      />
      <LimitConfirmModal ref={limitConfirmModalRef} onSuccess={onTradeSuccess} />
    </>
  );
}

export type TLimitSellBtn = {
  sell?: boolean;
  symbolA?: string;
  disabled?: boolean;
  loading?: boolean;
  checkAuth?: boolean;
  onClick: (() => void) | undefined;
  isFixState?: boolean;
};
export default function LimitSellBtn({
  sell,
  symbolA = '',
  disabled = false,
  loading = false,
  checkAuth,
  onClick,
  isFixState = false,
}: TLimitSellBtn) {
  const { t } = useTranslation();
  const { isLocking } = useConnectWallet();
  const isConnected = useIsConnected();

  const btnTxt = useMemo(() => {
    const symbolStr = formatSymbol(symbolA);
    if (isConnected || isFixState) return sell ? `${t('sell')} ${symbolStr}` : `${t('buy')} ${symbolStr}`;
    if (isLocking) return sell ? t('Unlock to Sell') : t('Unlock to Buy');
    return sell ? t('Log In to Sell') : t('Log In to Buy');
  }, [isConnected, isFixState, sell, t, symbolA, isLocking]);

  const style = useMemo(() => {
    if (isConnected || isFixState)
      return clsx('trading-button', {
        'trading-sell-button': sell,
        'trading-buy-button': !sell,
      });
    return clsx('trading-button', 'ant-btn-default');
  }, [isFixState, isConnected, sell]);
  return (
    <AuthBtn
      loading={loading}
      disabled={isConnected && disabled}
      className={style}
      onClick={onClick}
      checkAuth={checkAuth}
      size="large"
      block
      type="primary">
      <Font size={16} weight="medium" color={isConnected || isFixState ? 'one' : 'primary'}>
        {btnTxt}
      </Font>
    </AuthBtn>
  );
}
