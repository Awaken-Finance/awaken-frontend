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
import { TEN_THOUSAND, ZERO } from 'constants/misc';
import { useMobile } from 'utils/isMobile';
import CommonBlockProgress from 'components/CommonBlockProgress';
import { isZeroDecimalsNFT } from 'utils/NFT';
import { formatSymbol } from 'utils/token';
import { useTransactionFee } from 'contexts/useStore/hooks';
import { FeeRow } from 'pages/Swap/components/FeeRow';
import { SWAP_LABS_FEE_RATE, SWAP_RECEIVE_RATE } from 'constants/swap';
import { DepositLink } from 'components/DepositLink';

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
    () => divDecimals(reserves?.[getCurrencyAddress(tokenA)], tokenA?.decimals),
    [reserves, tokenA],
  );
  const minimumMaxReserveAmount = useMemo(
    () => minimumAmountOut(maxReserveAmount, userSlippageTolerance),
    [maxReserveAmount, userSlippageTolerance],
  );

  const maxAmount = useMemo(() => {
    const maxBalanceAmount = getAmountOut(
      rate,
      maxBalanceTotal,
      divDecimals(reserves?.[getCurrencyAddress(tokenB)], tokenB?.decimals),
      divDecimals(reserves?.[getCurrencyAddress(tokenA)], tokenA?.decimals),
    );

    return BigNumber.min(maxBalanceAmount, maxReserveAmount)
      .times(SWAP_RECEIVE_RATE)
      .dp(tokenA?.decimals ?? 8, BigNumber.ROUND_DOWN);
  }, [rate, maxBalanceTotal, reserves, tokenB, tokenA, maxReserveAmount]);

  const [progressValue, setProgressValue] = useState(0);
  const sliderValue = useMemo(() => {
    return +inputToSide(amount, maxAmount).toFixed(0);
  }, [amount, maxAmount]);

  const amountOutMin = useMemo(
    () =>
      BigNumber.min(
        minimumAmountOut(new BigNumber(amount), userSlippageTolerance),
        maxReserveAmount.times(SWAP_RECEIVE_RATE).dp(tokenA?.decimals || 0, BigNumber.ROUND_CEIL),
      ),
    [amount, maxReserveAmount, tokenA?.decimals, userSlippageTolerance],
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

    const maxPool = divDecimals(
      ZERO.plus(reserves?.[getCurrencyAddress(tokenA)] || 0)
        .times(SWAP_RECEIVE_RATE)
        .dp(0, BigNumber.ROUND_CEIL),
      tokenA?.decimals,
    );

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
        const realVal = ZERO.plus(val)
          .div(SWAP_RECEIVE_RATE)
          .dp(tokenA?.decimals || 0);

        const totalValue = getAmountByInput(
          rate,
          BigNumber.min(realVal, minimumMaxReserveAmount),
          divDecimals(reserves?.[getCurrencyAddress(tokenA)], tokenA?.decimals),
          divDecimals(reserves?.[getCurrencyAddress(tokenB)], tokenB?.decimals),
        );
        totalStr = bigNumberToUPString(totalValue, tokenB?.decimals);
      }
      setTotal(totalStr);
      setAmount(val);
      setProgressValue(0);
    },
    [minimumMaxReserveAmount, rate, reserves, tokenA, tokenB],
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
        ).times(SWAP_RECEIVE_RATE);
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
      const realNewAmount = ZERO.plus(newAmount)
        .div(SWAP_RECEIVE_RATE)
        .dp(tokenA?.decimals || 0, BigNumber.ROUND_DOWN);
      const newAmountStr = bigNumberToString(newAmount, tokenA?.decimals);

      const newTotal = getAmountByInput(
        rate,
        new BigNumber(realNewAmount),
        divDecimals(reserves?.[getCurrencyAddress(tokenA)], tokenA?.decimals),
        divDecimals(reserves?.[getCurrencyAddress(tokenB)], tokenB?.decimals),
      );
      const newTotalStr = bigNumberToUPString(newTotal, tokenB?.decimals);

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

  const limitFeeValue = useMemo(() => {
    if (!amount) return '-';
    return ZERO.plus(amount)
      .div(SWAP_RECEIVE_RATE)
      .times(SWAP_LABS_FEE_RATE)
      .div(TEN_THOUSAND)
      .dp(tokenA?.decimals || 1, BigNumber.ROUND_DOWN)
      .toFixed();
  }, [amount, tokenA?.decimals]);

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
            <FeeRow value={limitFeeValue} symbol={tokenA?.symbol || ''} />
          </Col>
          <Col span={24}>
            <TransactionFee />
          </Col>
        </Row>
      </Col>
      <Col span={24}>
        <SellBtnWithPay
          disabled={amountError.error || totalError.error}
          tokenIn={tokenB}
          tokenOut={tokenA}
          rate={rate}
          onClick={onClickSellBtn}
          valueIn={total}
          valueOut={amount}
          onTradeSuccess={() => {
            setAmount('');
            setTotal('');
            getReserves();
            setProgressValue(0);
          }}
        />
      </Col>
      {totalError.error && <DepositLink receiveToken={tokenB?.symbol} />}
    </Row>
  );
}
