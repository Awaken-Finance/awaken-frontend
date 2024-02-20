import { useCallback, useMemo, useState } from 'react';
import { Currency } from '@awaken/sdk-core';
import { Col, Row } from 'antd';
import BigNumber from 'bignumber.js';
import { useUserSettings } from 'contexts/useUserSettings';

import { CurrencyBalances, Reserves } from 'types/swap';
import { divDecimals } from 'utils/calculate';
import {
  bigNumberToString,
  getAmountOut,
  getCurrencyAddress,
  parseUserSlippageTolerance,
  inputToSide,
  minimumAmountOut,
  sideToInput,
  getPriceImpactWithSell,
  getAmountByInput,
  bigNumberToUPString,
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
import { isNFTSymbol } from 'utils/reg';

export default function RightCard({
  tokenA,
  tokenB,
  balances,
  reserves,
  rate,
  getReserves,
}: {
  setToken?: (currency?: Currency | undefined) => void;
  rate: string;
  tokenA?: Currency;
  tokenB?: Currency;
  balances?: CurrencyBalances;
  reserves?: Reserves;
  getReserves: () => void;
}) {
  const isMobile = useMobile();

  const balance = balances?.[getCurrencyAddress(tokenA)];

  const [{ userSlippageTolerance }] = useUserSettings();

  const [amount, setAmount] = useState('');

  const [total, setTotal] = useState('');

  const [showZeroInputTips, setShowZeroInputTips] = useState(false);

  const [transactionFee, setTransactionFee] = useState<BigNumber.Value>(0);

  const maxAmount = useMemo(() => {
    if (tokenA?.symbol === 'ELF' && balance?.gt(transactionFee)) {
      return divDecimals(balance?.minus(transactionFee), tokenA?.decimals);
    }
    return divDecimals(balance, tokenA?.decimals);
  }, [balance, tokenA, transactionFee]);

  const maxTotal = useMemo(() => {
    const val = BigNumber.min(
      maxAmount,
      getAmountByInput(
        rate,
        minimumAmountOut(divDecimals(reserves?.[getCurrencyAddress(tokenB)], tokenB?.decimals), userSlippageTolerance),
        divDecimals(reserves?.[getCurrencyAddress(tokenB)], tokenB?.decimals),
        divDecimals(reserves?.[getCurrencyAddress(tokenA)], tokenA?.decimals),
      ),
    );

    return getAmountOut(
      rate,
      val,
      divDecimals(reserves?.[getCurrencyAddress(tokenA)], tokenA?.decimals),
      divDecimals(reserves?.[getCurrencyAddress(tokenB)], tokenB?.decimals),
    ).dp(tokenB?.decimals ?? 8);
  }, [tokenA, reserves, maxAmount, userSlippageTolerance, rate, tokenB]);

  const [progressValue, setProgressValue] = useState(0);
  const sliderValue = useMemo(() => +inputToSide(amount, maxAmount).toFixed(0), [amount, maxAmount]);

  const amountOutMin = minimumAmountOut(new BigNumber(total), userSlippageTolerance);

  const priceImpact = useMemo(
    () =>
      getPriceImpactWithSell(
        divDecimals(reserves?.[getCurrencyAddress(tokenA)], tokenA?.decimals),
        divDecimals(reserves?.[getCurrencyAddress(tokenB)], tokenB?.decimals),
        amount,
        amountOutMin,
      ),
    [amount, amountOutMin, reserves, tokenA, tokenB],
  );

  const amountError = useMemo(() => {
    const bigInput = new BigNumber(amount);

    if (showZeroInputTips && (bigInput.isNaN() || bigInput.lte(0))) {
      return {
        text: 'Please enter amount',
        error: true,
      };
    }

    if (bigInput.gt(maxAmount)) {
      return {
        text: `Max amount ${bigNumberToString(maxAmount, tokenA?.decimals)} ${tokenA?.symbol}`,
        error: true,
      };
    }

    return {
      text: '',
      error: false,
    };
  }, [amount, maxAmount, showZeroInputTips, tokenA?.decimals, tokenA?.symbol]);

  const totalError = useMemo(() => {
    const bigTotal = new BigNumber(total);

    const maxPool = divDecimals(reserves?.[getCurrencyAddress(tokenB)], tokenB?.decimals);

    if (bigTotal.gt(maxPool)) {
      return {
        text: `Max output ${bigNumberToString(maxPool, tokenB?.decimals)} ${tokenB?.symbol}`,
        error: true,
      };
    }

    return {
      text: '',
      error: false,
    };
  }, [reserves, tokenB, total]);

  const inputAmount = useCallback(
    (val: string) => {
      let totalStr = '';
      if (val) {
        const totalValue = getAmountOut(
          rate,
          new BigNumber(val),
          divDecimals(reserves?.[getCurrencyAddress(tokenA)], tokenA?.decimals),
          divDecimals(reserves?.[getCurrencyAddress(tokenB)], tokenB?.decimals),
        );

        totalStr = bigNumberToString(totalValue, tokenB?.decimals);
      }

      setTotal(totalStr);
      setAmount(val);
      setProgressValue(0);
    },
    [rate, reserves, tokenA, tokenB],
  );

  const inputTotal = useCallback(
    (val: string) => {
      let amountStr = '';
      if (val) {
        const amountValue = getAmountByInput(
          rate,
          BigNumber.min(new BigNumber(val), maxTotal),
          divDecimals(reserves?.[getCurrencyAddress(tokenB)], tokenB?.decimals),
          divDecimals(reserves?.[getCurrencyAddress(tokenA)], tokenA?.decimals),
        );
        amountStr = bigNumberToUPString(amountValue, tokenA?.decimals);
      }

      setAmount(amountStr);
      setTotal(val);
      setProgressValue(0);
    },
    [maxTotal, rate, reserves, tokenA, tokenB],
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
      const newTotal = getAmountOut(
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
    [maxAmount, tokenA, rate, reserves, tokenB],
  );

  const onClickSellBtn = () => {
    setShowZeroInputTips(!amount);
  };

  const disabledTotal = useMemo(() => {
    return isNFTSymbol(tokenA?.symbol) && !isNFTSymbol(tokenB?.symbol);
  }, [tokenA?.symbol, tokenB?.symbol]);

  const disabledAmount = useMemo(() => {
    return !isNFTSymbol(tokenA?.symbol) && isNFTSymbol(tokenB?.symbol);
  }, [tokenA?.symbol, tokenB?.symbol]);

  useUpdateEffect(() => {
    setAmount('');
    setTotal('');
  }, [tokenA, tokenB, rate]);

  return (
    <Row gutter={[0, isMobile ? 12 : 16]}>
      <Col span={24}>
        <Row gutter={[0, isMobile ? 8 : 12]}>
          <Col span={24}>
            <PairBalance token={tokenA} balance={balance} />
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
            <TransactionFee onChange={(val) => setTransactionFee(val)} />
          </Col>
          <Col span={24}>
            <MinimumOutput value={amountOutMin} token={tokenB} maxValue={maxTotal} />
          </Col>
          <Col span={24}>
            <PriceImpact value={priceImpact} />
          </Col>
        </Row>
      </Col>
      <Col span={24}>
        <SellBtnWithPay
          disabled={amountError.error || totalError.error}
          tokenA={tokenA}
          tokenB={tokenB}
          sell
          rate={rate}
          amountBN={amount ? new BigNumber(amount) : ZERO}
          amountOutMin={amountOutMin}
          amount={amount.toString()}
          onClick={onClickSellBtn}
          onTradeSuccess={() => {
            setAmount('');
            setTotal('');
            getReserves();
          }}
        />
      </Col>
    </Row>
  );
}
