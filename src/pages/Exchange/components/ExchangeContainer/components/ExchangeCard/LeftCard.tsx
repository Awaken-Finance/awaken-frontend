import { useCallback, useMemo, useState } from 'react';
import { Currency } from '@awaken/sdk-core';
import { Col, Row } from 'antd';
import BigNumber from 'bignumber.js';
import { useUserSettings } from 'contexts/useUserSettings';

import { CurrencyBalances, Reserves } from 'types/swap';
import { divDecimals } from 'utils/calculate';
import {
  bigNumberToUPString,
  getCurrencyAddress,
  parseUserSlippageTolerance,
  inputToSide,
  minimumAmountOut,
  sideToInput,
  getAmountByInput,
  getPriceImpactWithBuy,
  getAmountOut,
  bigNumberToString,
} from 'utils/swap';
import { useUpdateEffect } from 'react-use';

import PairBalance from './components/PairBalance';
import CurrentPrice from './components/CurrentPrice';
import InputAmount from './components/InputAmount';
import CommonSlider from 'components/CommonSlider';
import Slippage from './components/Slippage';
import TransactionFee from './components/TransactionFee';
import MinimumOutput from './components/MinimumOutput';
import PriceImpact from './components/PriceImpact';
import { SellBtnWithPay } from 'Buttons/SellBtn/SellBtn';
import { ZERO } from 'constants/misc';
import { useMobile } from 'utils/isMobile';
import CommonBlockProgress from 'components/CommonBlockProgress';
import { isZeroDecimalsNFT } from 'utils/NFT';
import { formatSymbol } from 'utils/token';
import { useTransactionFee } from 'contexts/useStore/hooks';

export type TLeftCardProps = {
  rate: string;
  tokenA?: Currency;
  tokenB?: Currency;
  balances?: CurrencyBalances;
  reserves?: Reserves;
  getReserves: () => void;
};
export default function LeftCard({ tokenA, tokenB, balances, reserves, rate, getReserves }: TLeftCardProps) {
  const isMobile = useMobile();

  const balance = balances?.[getCurrencyAddress(tokenB)];

  const [{ userSlippageTolerance }] = useUserSettings();

  const transactionFee = useTransactionFee();

  const [amount, setAmount] = useState('');

  const [total, setTotal] = useState('');

  const [showZeroInputTips, setShowZeroInputTips] = useState(false);

  const maxBalanceTotal = useMemo(() => {
    if (tokenB?.symbol === 'ELF' && balance?.gt(transactionFee)) {
      return divDecimals(balance?.minus(transactionFee), tokenB?.decimals);
    }
    return divDecimals(balance, tokenB?.decimals);
  }, [balance, tokenB, transactionFee]);

  const maxReserveAmount = useMemo(
    () =>
      minimumAmountOut(divDecimals(reserves?.[getCurrencyAddress(tokenA)], tokenA?.decimals), userSlippageTolerance),
    [reserves, tokenA, userSlippageTolerance],
  );

  const maxAmount = useMemo(() => {
    const maxBalanceAmount = getAmountOut(
      rate,
      maxBalanceTotal,
      divDecimals(reserves?.[getCurrencyAddress(tokenB)], tokenB?.decimals),
      divDecimals(reserves?.[getCurrencyAddress(tokenA)], tokenA?.decimals),
    );

    return BigNumber.min(maxBalanceAmount, maxReserveAmount).dp(tokenA?.decimals ?? 8);
  }, [rate, maxBalanceTotal, reserves, tokenB, tokenA, maxReserveAmount]);

  const [progressValue, setProgressValue] = useState(0);
  const sliderValue = useMemo(() => {
    return +inputToSide(amount, maxAmount).toFixed(0);
  }, [amount, maxAmount]);

  const amountOutMin = useMemo(
    () => BigNumber.min(minimumAmountOut(new BigNumber(amount), userSlippageTolerance), maxReserveAmount),
    [amount, maxReserveAmount, userSlippageTolerance],
  );

  const priceImpact = useMemo(() => {
    return getPriceImpactWithBuy(
      divDecimals(reserves?.[getCurrencyAddress(tokenA)], tokenA?.decimals),
      divDecimals(reserves?.[getCurrencyAddress(tokenB)], tokenB?.decimals),
      total,
      ZERO.plus(amount),
    );
  }, [tokenA, tokenB, reserves, total, amount]);

  const amountError = useMemo(() => {
    const bigInput = new BigNumber(amount);

    if (showZeroInputTips && (bigInput.isNaN() || bigInput.lte(0))) {
      return {
        text: 'Please enter amount',
        error: true,
      };
    }

    const maxPool = divDecimals(reserves?.[getCurrencyAddress(tokenA)], tokenA?.decimals);

    if (bigInput.gt(maxPool)) {
      return {
        text: `Max output ${bigNumberToString(maxPool, tokenA?.decimals)} ${formatSymbol(tokenA?.symbol)}`,
        error: true,
      };
    }

    return {
      text: '',
      error: false,
    };
  }, [amount, reserves, showZeroInputTips, tokenA]);

  const totalError = useMemo(() => {
    const bigTotal = new BigNumber(total);

    if (bigTotal.gt(maxBalanceTotal)) {
      return {
        text: `Max amount ${bigNumberToString(maxBalanceTotal, tokenB?.decimals)} ${formatSymbol(tokenB?.symbol)}`,
        error: true,
      };
    }

    return {
      text: '',
      error: false,
    };
  }, [maxBalanceTotal, tokenB?.decimals, tokenB?.symbol, total]);

  const inputAmount = useCallback(
    (val: string) => {
      let totalStr = '';
      if (val) {
        const totalValue = getAmountByInput(
          rate,
          BigNumber.min(new BigNumber(val), maxReserveAmount),
          divDecimals(reserves?.[getCurrencyAddress(tokenA)], tokenA?.decimals),
          divDecimals(reserves?.[getCurrencyAddress(tokenB)], tokenB?.decimals),
        );
        totalStr = bigNumberToUPString(totalValue, tokenB?.decimals);
      }
      setTotal(totalStr);
      setAmount(val);
      setProgressValue(0);
    },
    [maxReserveAmount, rate, reserves, tokenA, tokenB],
  );

  const inputTotal = useCallback(
    (val: string) => {
      let amountStr = '';
      if (val) {
        const amountValue = getAmountOut(
          rate,
          new BigNumber(val),
          divDecimals(reserves?.[getCurrencyAddress(tokenB)], tokenB?.decimals),
          divDecimals(reserves?.[getCurrencyAddress(tokenA)], tokenA?.decimals),
        );
        amountStr = bigNumberToString(amountValue, tokenA?.decimals);
      }

      setAmount(amountStr);
      setTotal(val);
      setProgressValue(0);
    },
    [rate, reserves, tokenA, tokenB],
  );

  const sliderAmount = useCallback(
    (val: number) => {
      if (new BigNumber('0').isEqualTo(val)) {
        setAmount('');
        setTotal('');
        setProgressValue(0);
        return;
      }

      const newAmount = sideToInput(val, maxAmount);
      const newAmountStr = bigNumberToString(newAmount, tokenA?.decimals);
      const newTotal = getAmountByInput(
        rate,
        new BigNumber(newAmount),
        divDecimals(reserves?.[getCurrencyAddress(tokenA)], tokenA?.decimals),
        divDecimals(reserves?.[getCurrencyAddress(tokenB)], tokenB?.decimals),
      );
      const newTotalStr = bigNumberToString(newTotal, tokenB?.decimals);

      setTotal(newTotalStr);
      setAmount(newAmountStr);
      setProgressValue(newAmount.isNaN() || newAmount.lte(0) ? 0 : val);
    },
    [maxAmount, rate, reserves, tokenA, tokenB],
  );

  const onClickSellBtn = () => {
    setShowZeroInputTips(!amount);
  };

  const disabledTotal = useMemo(() => {
    return isZeroDecimalsNFT(tokenA?.decimals) && !isZeroDecimalsNFT(tokenB?.decimals);
  }, [tokenA?.decimals, tokenB?.decimals]);

  const disabledAmount = useMemo(() => {
    return !isZeroDecimalsNFT(tokenA?.decimals) && isZeroDecimalsNFT(tokenB?.decimals);
  }, [tokenA?.decimals, tokenB?.decimals]);

  useUpdateEffect(() => {
    setAmount('');
    setTotal('');
  }, [tokenA, tokenB, rate]);

  return (
    <Row gutter={[0, isMobile ? 12 : 16]}>
      <Col span={24}>
        <Row gutter={[0, isMobile ? 8 : 12]}>
          <Col span={24}>
            <PairBalance token={tokenB} balance={balance} />
          </Col>
          <Col span={24}>
            <CurrentPrice tokenA={tokenA} tokenB={tokenB} reserves={reserves} />
          </Col>
          <Col span={24}>
            <InputAmount
              token={tokenA}
              value={amount}
              onChange={inputAmount}
              onFocus={() => setShowZeroInputTips(false)}
              {...amountError}
              disabled={disabledAmount}
            />
          </Col>
          <Col span={24}>
            {isMobile ? (
              <CommonBlockProgress
                value={progressValue}
                onChange={sliderAmount}
                disabled={disabledAmount || disabledTotal}
              />
            ) : (
              <CommonSlider value={sliderValue} onChange={sliderAmount} disabled={disabledAmount || disabledTotal} />
            )}
          </Col>
          <Col span={24}>
            <InputAmount
              token={tokenB}
              value={total}
              onChange={inputTotal}
              onFocus={() => setShowZeroInputTips(false)}
              {...totalError}
              type="total"
              disabled={disabledTotal}
            />
          </Col>
        </Row>
      </Col>
      <Col span={24}>
        <Row gutter={[0, isMobile ? 8 : 12]}>
          <Col span={24}>
            <Slippage value={parseUserSlippageTolerance(userSlippageTolerance)} />
          </Col>
          <Col span={24}>
            <MinimumOutput value={amountOutMin} token={tokenA} />
          </Col>
          <Col span={24}>
            <PriceImpact value={priceImpact} />
          </Col>
          <Col span={24}>
            <TransactionFee />
          </Col>
        </Row>
      </Col>
      <Col span={24}>
        <SellBtnWithPay
          disabled={amountError.error || totalError.error}
          tokenA={tokenA}
          tokenB={tokenB}
          rate={rate}
          onClick={onClickSellBtn}
          amountBN={total ? new BigNumber(total) : ZERO}
          amountOutMin={amountOutMin}
          amount={total}
          onTradeSuccess={() => {
            setAmount('');
            setTotal('');
            getReserves();
            setProgressValue(0);
          }}
        />
      </Col>
    </Row>
  );
}
