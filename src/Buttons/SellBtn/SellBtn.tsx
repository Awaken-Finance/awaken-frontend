import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Currency } from '@awaken/sdk-core';
import { ONE, REQ_CODE, ZERO } from 'constants/misc';
import { useTranslation } from 'react-i18next';
import Font from 'components/Font';
import { onSwap } from 'utils/swapContract';
import { timesDecimals } from 'utils/calculate';
import { useActiveWeb3React } from 'hooks/web3';
import { useAElfContract } from 'hooks/useContract';
import useAllowanceAndApprove from 'hooks/useApprove';
import { getCurrencyAddress, getDeadline, minimumAmountOut } from 'utils/swap';
import { ChainConstants } from 'constants/ChainConstants';
import AuthBtn from 'Buttons/AuthBtn';

import './index.less';
import { formatSymbol } from 'utils/token';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import { useIsConnected } from 'hooks/useLogin';
import { SWAP_HOOK_CONTRACT_ADDRESS } from 'constants/index';
import { getCID } from 'utils';
import { useUserSettings } from 'contexts/useUserSettings';
import BigNumber from 'bignumber.js';

interface SellBtnProps {
  sell?: boolean;
  rate: string;
  tokenIn?: Currency;
  tokenOut?: Currency;
  valueIn?: string;
  valueOut?: string;
  checkAuth?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  onTradeSuccess: () => void;
}

export function SellBtnWithPay({
  sell,
  rate,
  tokenIn,
  tokenOut,
  valueIn,
  valueOut,
  disabled,
  loading,
  onClick,
  onTradeSuccess,
}: SellBtnProps) {
  const { t } = useTranslation();
  const { account } = useActiveWeb3React();
  const contract = useAElfContract(SWAP_HOOK_CONTRACT_ADDRESS);
  const [trading, setTrading] = useState(false);
  const tokenInAddr = useMemo(() => getCurrencyAddress(tokenIn), [tokenIn]);
  const [{ userSlippageTolerance }] = useUserSettings();

  const { approve, checkAllowance } = useAllowanceAndApprove(
    ChainConstants.constants.TOKEN_CONTRACT,
    tokenInAddr,
    account || undefined,
    contract?.address,
  );

  const buttonDisabled = useMemo(() => {
    return disabled || !tokenIn || !tokenOut || !rate || !tokenIn?.symbol || !tokenOut?.symbol;
  }, [disabled, rate, tokenIn, tokenOut]);

  const handleClick = async () => {
    if (!account) {
      return;
    }
    onClick?.();
    if (!valueIn || !valueOut || !tokenIn || !tokenOut) return;

    setTrading(true);
    try {
      const valueInAmountBN = timesDecimals(valueIn, tokenIn.decimals);
      const valueOutAmountBN = timesDecimals(valueOut, tokenOut.decimals);
      const amountMinOutAmountBN = BigNumber.max(
        minimumAmountOut(valueOutAmountBN, userSlippageTolerance).dp(0, BigNumber.ROUND_DOWN),
        ONE,
      );

      const allowance = await checkAllowance();
      if (valueInAmountBN.gt(allowance)) {
        await approve(valueInAmountBN);
      }

      const deadline = getDeadline();
      const channel = getCID();

      const req = await onSwap({
        account,
        routerContract: contract,
        tokenA: tokenOut,
        tokenB: tokenIn,
        amountIn: valueInAmountBN,
        amountOutMin: amountMinOutAmountBN,
        methodName: 'swapExactTokensForTokens',
        swapTokens: [
          {
            amountIn: valueInAmountBN.toFixed(),
            amountOutMin: amountMinOutAmountBN.toFixed(),
            channel,
            deadline,
            path: [tokenIn.symbol, tokenOut.symbol],
            to: account,
            feeRates: [ZERO.plus(100).times(rate).toNumber()],
          },
        ],
        t,
      });

      if (req !== REQ_CODE.UserDenied) {
        onTradeSuccess();
      }
    } catch (error) {
      console.log('e: ', error);
    } finally {
      setTrading(false);
    }
  };

  return (
    <SellBtn
      sell={sell}
      symbolA={sell ? tokenIn?.symbol : tokenOut?.symbol}
      disabled={buttonDisabled}
      loading={trading || loading}
      onClick={handleClick}
    />
  );
}

export type TSellBtnProps = {
  sell?: boolean;
  symbolA?: string;
  disabled?: boolean;
  loading?: boolean;
  checkAuth?: boolean;
  onClick?: () => void;
  isFixState?: boolean;
};
export default function SellBtn({
  sell,
  symbolA = '',
  disabled = false,
  loading = false,
  checkAuth,
  onClick,
  isFixState = false,
}: TSellBtnProps) {
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
