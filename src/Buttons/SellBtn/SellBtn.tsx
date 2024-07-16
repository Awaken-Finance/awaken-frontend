import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Currency } from '@awaken/sdk-core';
import { REQ_CODE } from 'constants/misc';
import { useTranslation } from 'react-i18next';
import BigNumber from 'bignumber.js';

import Font from 'components/Font';

import { onSwap } from 'utils/swapContract';
import { divDecimals, timesDecimals } from 'utils/calculate';

import { useActiveWeb3React } from 'hooks/web3';
import { useRouterContract } from 'hooks/useContract';
import useAllowanceAndApprove from 'hooks/useApprove';
import { getCurrencyAddress } from 'utils/swap';
import { ChainConstants } from 'constants/ChainConstants';
import AuthBtn from 'Buttons/AuthBtn';

import './index.less';
import { useIsPortkeySDK } from 'hooks/useIsPortkeySDK';
import { formatSymbol } from 'utils/token';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';

interface SellBtnProps {
  sell?: boolean;
  rate: string;
  tokenA?: Currency;
  tokenB?: Currency;
  amount?: string;
  amountBN: BigNumber;
  amountOutMin?: BigNumber;
  checkAuth?: boolean;
  onClick?: () => void;
  symbolA?: string;
  symbolB?: string;
  disabled?: boolean;
  loading?: boolean;
  onTradeSuccess: () => void;
}

export function SellBtnWithPay({
  sell,
  rate,
  tokenA,
  tokenB,
  amount,
  amountBN,
  amountOutMin,
  disabled,
  loading,
  onClick,
  onTradeSuccess,
}: SellBtnProps) {
  const { t } = useTranslation();
  const { account } = useActiveWeb3React();
  const contract = useRouterContract(rate);
  const [trading, setTrading] = useState(false);
  const tokenAAddr = useMemo(() => getCurrencyAddress(tokenA), [tokenA]);
  const tokenBAddr = useMemo(() => getCurrencyAddress(tokenB), [tokenB]);

  const { approve, checkAllowance } = useAllowanceAndApprove(
    ChainConstants.constants.TOKEN_CONTRACT,
    sell ? tokenAAddr : tokenBAddr,
    account || undefined,
    contract?.address,
  );

  const buttonDisabled = useMemo(() => {
    return disabled || !tokenA || !tokenB || !rate || !tokenA?.symbol || !tokenB?.symbol;
  }, [disabled, rate, tokenA, tokenB]);

  const handleClick = async () => {
    if (!account) {
      return;
    }
    onClick?.();

    if (!amount || amountOutMin?.lte(0)) return;
    if (amountBN.isNaN() || amountBN.lte(0)) return;

    setTrading(true);
    try {
      const allowance = await checkAllowance();
      const allowanceBN = new BigNumber(allowance);
      const allowanceBNDivDec = divDecimals(allowanceBN, sell ? tokenA?.decimals : tokenB?.decimals);
      const amountBN = new BigNumber(amount || 0);
      if (allowanceBNDivDec.lt(amountBN)) {
        await approve(timesDecimals(amountBN, sell ? tokenA?.decimals : tokenB?.decimals));
      }

      const req = await onSwap({
        account,
        routerContract: contract,
        tokenA: sell ? tokenB : tokenA,
        tokenB: sell ? tokenA : tokenB,
        amountIn: timesDecimals(amount, sell ? tokenA?.decimals : tokenB?.decimals),
        amountOutMin: timesDecimals(amountOutMin, sell ? tokenB?.decimals : tokenA?.decimals),
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
      symbolA={tokenA?.symbol}
      disabled={buttonDisabled}
      loading={trading || loading}
      onClick={handleClick}
    />
  );
}

export default function SellBtn({
  sell,
  symbolA = '',
  disabled = false,
  loading = false,
  checkAuth,
  onClick,
  isFixState = false,
}: Omit<SellBtnProps, 'amountBN' | 'rate' | 'tokenA' | 'tokenB' | 'onTradeSuccess'> & { isFixState?: boolean }) {
  const { t } = useTranslation();
  const { isConnected } = useConnectWallet();
  const isPortkeySDK = useIsPortkeySDK();

  const btnTxt = useMemo(() => {
    const symbolStr = formatSymbol(symbolA);
    if (isConnected || isFixState) return sell ? `${t('sell')} ${symbolStr}` : `${t('buy')} ${symbolStr}`;
    if (isPortkeySDK) return sell ? t('Unlock to Sell') : t('Unlock to Buy');
    return sell ? t('Log In to Sell') : t('Log In to Buy');
  }, [isConnected, isFixState, sell, t, symbolA, isPortkeySDK]);

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
