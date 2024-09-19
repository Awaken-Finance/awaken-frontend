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
import { TEN_THOUSAND, ZERO } from 'constants/misc';
import { useMobile } from 'utils/isMobile';
import CommonBlockProgress from 'components/CommonBlockProgress';
import { isZeroDecimalsNFT } from 'utils/NFT';
import { formatSymbol } from 'utils/token';
import { useTransactionFee } from 'contexts/useStore/hooks';
import { FeeRow } from 'pages/Swap/components/FeeRow';
import { SWAP_LABS_FEE_RATE, SWAP_RECEIVE_RATE } from 'constants/swap';
import { DepositLink } from 'components/DepositLink';

export type TRightCardProps = {
  rate: string;
  tokenA?: Currency;
  tokenB?: Currency;
  balances?: CurrencyBalances;
  reserves?: Reserves;
  getReserves: () => void;
};
export default function RightCard({ tokenA, tokenB, balances, reserves, rate, getReserves }: TRightCardProps) {
  const isMobile = useMobile();

  const balance = balances?.[getCurrencyAddress(tokenA)];

  const [{ userSlippageTolerance }] = useUserSettings();

  const [amount, setAmount] = useState('');

  const [total, setTotal] = useState('');

  const [showZeroInputTips, setShowZeroInputTips] = useState(false);

  const transactionFee = useTransactionFee();

  const maxBalanceAmount = useMemo(() => {
    if (tokenA?.symbol === 'ELF' && balance?.gt(transactionFee)) {
      return divDecimals(balance?.minus(transactionFee), tokenA?.decimals);
    }
    return divDecimals(balance, tokenA?.decimals);
  }, [balance, tokenA, transactionFee]);

  const maxReserveTotal = useMemo(
    () =>
      minimumAmountOut(divDecimals(reserves?.[getCurrencyAddress(tokenB)], tokenB?.decimals), userSlippageTolerance),
    [reserves, tokenB, userSlippageTolerance],
  );

  const [progressValue, setProgressValue] = useState(0);
  const sliderValue = useMemo(() => +inputToSide(amount, maxBalanceAmount).toFixed(0), [amount, maxBalanceAmount]);

  const amountOutMin = useMemo(
    () => BigNumber.min(minimumAmountOut(new BigNumber(total), userSlippageTolerance), maxReserveTotal),
    [maxReserveTotal, total, userSlippageTolerance],
  );

  const priceImpact = useMemo(() => {
    return getPriceImpactWithSell(
      divDecimals(reserves?.[getCurrencyAddress(tokenA)], tokenA?.decimals),
      divDecimals(reserves?.[getCurrencyAddress(tokenB)], tokenB?.decimals),
      amount,
      ZERO.plus(total),
    );
  }, [amount, reserves, tokenA, tokenB, total]);

  const amountError = useMemo(() => {
    const bigInput = new BigNumber(amount);

    if (showZeroInputTips && (bigInput.isNaN() || bigInput.lte(0))) {
      return {
        text: 'Please enter amount',
        error: true,
      };
    }

    if (bigInput.gt(maxBalanceAmount)) {
      return {
        text: `Max amount ${bigNumberToString(maxBalanceAmount, tokenA?.decimals)} ${formatSymbol(tokenA?.symbol)}`,
        error: true,
      };
    }

    return {
      text: '',
      error: false,
    };
  }, [amount, maxBalanceAmount, showZeroInputTips, tokenA?.decimals, tokenA?.symbol]);

  const totalError = useMemo(() => {
    const bigTotal = new BigNumber(total);

    const maxPool = divDecimals(
      ZERO.plus(reserves?.[getCurrencyAddress(tokenB)] || 0)
        .times(SWAP_RECEIVE_RATE)
        .dp(0, BigNumber.ROUND_CEIL),
      tokenB?.decimals,
    );

    if (bigTotal.gt(maxPool)) {
      return {
        text: `Max output ${bigNumberToString(maxPool, tokenB?.decimals)} ${formatSymbol(tokenB?.symbol)}`,
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
        ).times(SWAP_RECEIVE_RATE);

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
        const realVal = ZERO.plus(val)
          .div(SWAP_RECEIVE_RATE)
          .dp(tokenA?.decimals || 0);
        const amountValue = getAmountByInput(
          rate,
          BigNumber.min(new BigNumber(realVal), maxReserveTotal),
          divDecimals(reserves?.[getCurrencyAddress(tokenB)], tokenB?.decimals),
          divDecimals(reserves?.[getCurrencyAddress(tokenA)], tokenA?.decimals),
        );
        amountStr = bigNumberToUPString(amountValue, tokenA?.decimals);
      }

      setAmount(amountStr);
      setTotal(val);
      setProgressValue(0);
    },
    [maxReserveTotal, rate, reserves, tokenA, tokenB],
  );

  const sliderAmount = useCallback(
    (val: number) => {
      if (new BigNumber('0').isEqualTo(val)) {
        setAmount('');
        setTotal('');
        setProgressValue(0);
        return;
      }

      const newAmount = sideToInput(val, maxBalanceAmount);
      const newAmountStr = bigNumberToString(newAmount, tokenA?.decimals);
      const newTotal = getAmountOut(
        rate,
        new BigNumber(newAmount),
        divDecimals(reserves?.[getCurrencyAddress(tokenA)], tokenA?.decimals),
        divDecimals(reserves?.[getCurrencyAddress(tokenB)], tokenB?.decimals),
      ).times(SWAP_RECEIVE_RATE);
      const newTotalStr = bigNumberToString(newTotal, tokenB?.decimals);

      setTotal(newTotalStr);
      setAmount(newAmountStr);
      setProgressValue(newAmount.isNaN() || newAmount.lte(0) ? 0 : val);
    },
    [maxBalanceAmount, tokenA, rate, reserves, tokenB],
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
    if (!total) return '-';
    return ZERO.plus(total)
      .div(SWAP_RECEIVE_RATE)
      .times(SWAP_LABS_FEE_RATE)
      .div(TEN_THOUSAND)
      .dp(tokenB?.decimals || 1, BigNumber.ROUND_DOWN)
      .toFixed();
  }, [total, tokenB?.decimals]);

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
            <MinimumOutput value={amountOutMin} token={tokenB} />
          </Col>
          <Col span={24}>
            <PriceImpact value={priceImpact} />
          </Col>
          <Col span={24}>
            <FeeRow value={limitFeeValue} symbol={tokenB?.symbol || ''} />
          </Col>
          <Col span={24}>
            <TransactionFee />
          </Col>
        </Row>
      </Col>
      <Col span={24}>
        <SellBtnWithPay
          sell
          disabled={amountError.error || totalError.error}
          tokenIn={tokenA}
          tokenOut={tokenB}
          rate={rate}
          onClick={onClickSellBtn}
          valueIn={amount}
          valueOut={total}
          onTradeSuccess={() => {
            setAmount('');
            setTotal('');
            setProgressValue(0);
            getReserves();
          }}
        />
      </Col>
      {amountError.error && <DepositLink receiveToken={tokenA?.symbol} />}
    </Row>
  );
}
