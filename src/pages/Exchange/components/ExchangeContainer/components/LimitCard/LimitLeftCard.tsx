import { useCallback, useMemo, useRef, useState } from 'react';
import { Currency } from '@awaken/sdk-core';
import { Col, Row } from 'antd';
import BigNumber from 'bignumber.js';
import { CurrencyBalances, Reserves } from 'types/swap';
import { divDecimals } from 'utils/calculate';
import { getCurrencyAddress, inputToSide, sideToInput, bigNumberToString } from 'utils/swap';
import { useUpdateEffect } from 'react-use';
import { TEN_THOUSAND, ZERO } from 'constants/misc';
import { useMobile } from 'utils/isMobile';
import CommonBlockProgress from 'components/CommonBlockProgress';
import { isZeroDecimalsNFT } from 'utils/NFT';
import { formatSymbol } from 'utils/token';
import PairBalance from '../ExchangeCard/components/PairBalance';
import InputAmount from '../ExchangeCard/components/InputAmount';
import CommonSlider from 'components/CommonSlider';
import TransactionFee from '../ExchangeCard/components/TransactionFee';
import { LimitMaxValue } from './components/LimitMaxValue';
import { ExpiryEnum, LimitExpiry } from './components/LimitExpiry';

import { LimitSellBtnWithPay } from 'Buttons/LimitSellBtn';
import { useTransactionFee } from 'contexts/useStore/hooks';
import { FeeRow } from 'pages/Swap/components/FeeRow';
import { LimitPairPrice } from 'pages/Swap/components/LimitPairPrice';
import { LIMIT_LABS_FEE_RATE, LIMIT_RECEIVE_RATE } from 'constants/swap';
import { DepositLink } from 'components/DepositLink';

export type TLimitLeftCardProps = {
  rate: string;
  tokenA?: Currency;
  tokenB?: Currency;
  balances?: CurrencyBalances;
  reserves?: Reserves;
};

export const LimitLeftCard = ({ tokenA, tokenB, balances, reserves, rate }: TLimitLeftCardProps) => {
  const isMobile = useMobile();
  const balance = balances?.[getCurrencyAddress(tokenB)];
  const transactionFee = useTransactionFee();

  const [amount, setAmount] = useState('');
  const [total, setTotal] = useState('');
  const [isAmountZeroShow, setIsAmountZeroShow] = useState(false);
  const [isTotalZeroShow, setIsTotalZeroShow] = useState(false);
  const [isPriceZeroShow, setIsPriceZeroShow] = useState(false);
  const [tokenAPrice, setTokenAPrice] = useState('0');
  const [expiryValue, setExpiryValue] = useState(ExpiryEnum.day);

  const [_isAmountFocus, setIsAmountFocus] = useState(false);
  const disabledTotal = useMemo(() => {
    return isZeroDecimalsNFT(tokenA?.decimals) && !isZeroDecimalsNFT(tokenB?.decimals);
  }, [tokenA?.decimals, tokenB?.decimals]);

  const disabledAmount = useMemo(() => {
    return !isZeroDecimalsNFT(tokenA?.decimals) && isZeroDecimalsNFT(tokenB?.decimals);
  }, [tokenA?.decimals, tokenB?.decimals]);
  const isAmountFocus = useMemo(() => {
    if (disabledTotal) return true;
    if (disabledAmount) return false;
    return _isAmountFocus;
  }, [_isAmountFocus, disabledAmount, disabledTotal]);

  const reserve = useMemo(() => {
    if (!reserves) return undefined;
    return {
      reserveIn: reserves[tokenB?.symbol || ''],
      reserveOut: reserves[tokenA?.symbol || ''],
    };
  }, [reserves, tokenA?.symbol, tokenB?.symbol]);

  const maxBalanceTotal = useMemo(() => {
    if (tokenB?.symbol === 'ELF' && balance?.gt(transactionFee)) {
      return divDecimals(balance?.minus(transactionFee), tokenB?.decimals);
    }
    return divDecimals(balance, tokenB?.decimals);
  }, [balance, tokenB, transactionFee]);

  const maxAmount = useMemo(() => {
    if (ZERO.gte(tokenAPrice) || !tokenAPrice) return ZERO;
    return maxBalanceTotal
      .div(tokenAPrice)
      .times(LIMIT_RECEIVE_RATE)
      .dp(tokenA?.decimals || 0, BigNumber.ROUND_FLOOR);
  }, [tokenAPrice, maxBalanceTotal, tokenA?.decimals]);

  const [progressValue, setProgressValue] = useState(0);
  const sliderValue = useMemo(() => {
    return +inputToSide(amount, maxAmount).toFixed(0);
  }, [amount, maxAmount]);

  const amountError = useMemo(() => {
    const bigInput = new BigNumber(amount);

    if (isAmountZeroShow && (bigInput.isNaN() || bigInput.lte(0))) {
      return {
        text: 'Please enter amount',
        error: true,
      };
    }

    if (bigInput.gt(maxAmount)) {
      return {
        text: `Max output ${maxAmount} ${formatSymbol(tokenA?.symbol)}`,
        error: true,
      };
    }

    return {
      text: '',
      error: false,
    };
  }, [amount, maxAmount, isAmountZeroShow, tokenA?.symbol]);

  const totalError = useMemo(() => {
    const bigTotal = new BigNumber(total);

    if (isTotalZeroShow && (bigTotal.isNaN() || bigTotal.lte(0))) {
      return {
        text: 'Please enter total',
        error: true,
      };
    }

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
  }, [isTotalZeroShow, maxBalanceTotal, tokenB?.decimals, tokenB?.symbol, total]);

  const inputAmount = useCallback(
    (val: string, _tokenAPrice?: string) => {
      setIsAmountFocus(true);
      const price = _tokenAPrice ?? tokenAPrice;
      if (ZERO.gte(price) || !price) {
        setTotal('');
        setAmount(val);
        setProgressValue(0);
        return;
      }
      let totalStr = '';
      if (val) {
        const realVal = ZERO.plus(val)
          .div(LIMIT_RECEIVE_RATE)
          .dp(tokenA?.decimals || 0);
        totalStr = ZERO.plus(realVal)
          .times(price)
          .dp(tokenB?.decimals || 0, BigNumber.ROUND_CEIL)
          .toFixed();
      }
      setTotal(totalStr);
      setAmount(val);
      setProgressValue(0);
    },
    [tokenA?.decimals, tokenAPrice, tokenB?.decimals],
  );

  const inputTotal = useCallback(
    (val: string, _tokenAPrice?: string) => {
      setIsAmountFocus(false);
      const price = _tokenAPrice ?? tokenAPrice;
      if (ZERO.gte(price) || !price) {
        setAmount('');
        setTotal(val);
        setProgressValue(0);
        return;
      }
      let amountStr = '';
      if (val) {
        amountStr = ZERO.plus(val)
          .div(price)
          .times(LIMIT_RECEIVE_RATE)
          .dp(tokenA?.decimals || 0, BigNumber.ROUND_FLOOR)
          .toFixed();
      }

      setAmount(amountStr);
      setTotal(val);
      setProgressValue(0);
    },
    [tokenA?.decimals, tokenAPrice],
  );

  const sliderAmount = useCallback(
    (val: number) => {
      setIsAmountFocus(true);
      if (new BigNumber('0').isEqualTo(val)) {
        setAmount('');
        setTotal('');
        setProgressValue(0);
        return;
      }

      const newAmount = sideToInput(val, maxAmount);
      const realNewAmount = ZERO.plus(newAmount)
        .div(LIMIT_RECEIVE_RATE)
        .dp(tokenA?.decimals || 0, BigNumber.ROUND_DOWN);
      const newAmountStr = bigNumberToString(newAmount, tokenA?.decimals);
      const newTotal = realNewAmount
        .times(tokenAPrice)
        .dp(tokenB?.decimals || 0, BigNumber.ROUND_CEIL)
        .toFixed();

      setTotal(newTotal);
      setAmount(newAmountStr);
      setProgressValue(newAmount.isNaN() || newAmount.lte(0) ? 0 : val);
    },
    [maxAmount, tokenA?.decimals, tokenAPrice, tokenB?.decimals],
  );

  useUpdateEffect(() => {
    setAmount('');
    setTotal('');
  }, [tokenA, tokenB, rate]);

  const refreshValue = useCallback(
    (price: string) => {
      if (isAmountFocus) {
        inputAmount(amount, price);
      } else {
        inputTotal(total, price);
      }
    },
    [amount, inputAmount, inputTotal, isAmountFocus, total],
  );
  const refreshValueRef = useRef(refreshValue);
  refreshValueRef.current = refreshValue;
  const onPairPriceChange = useCallback((value: string) => {
    setTokenAPrice(value);
    refreshValueRef.current(value);
  }, []);

  const onClickSellBtn = () => {
    setIsAmountZeroShow(!amount);
    setIsTotalZeroShow(!total);
    setIsPriceZeroShow(!tokenAPrice);
  };

  const limitFeeValue = useMemo(() => {
    if (!amount) return '-';
    return ZERO.plus(amount)
      .div(LIMIT_RECEIVE_RATE)
      .times(LIMIT_LABS_FEE_RATE)
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
            <LimitPairPrice
              tokenIn={tokenB}
              tokenOut={tokenA}
              reserve={reserve}
              onChange={onPairPriceChange}
              onFocus={() => setIsPriceZeroShow(false)}
              isSwap={false}
              isZeroShow={isPriceZeroShow}
            />
          </Col>
          <Col span={24}>
            <InputAmount
              token={tokenA}
              value={amount}
              onChange={inputAmount}
              onFocus={() => setIsAmountZeroShow(false)}
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
              onFocus={() => setIsTotalZeroShow(false)}
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
            <LimitMaxValue token={tokenA} value={maxAmount} />
          </Col>
          <Col span={24}>
            <LimitExpiry value={expiryValue} onChange={setExpiryValue} />
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
        <LimitSellBtnWithPay
          disabled={amountError.error || totalError.error}
          tokenIn={tokenB}
          tokenOut={tokenA}
          amountIn={total}
          amountOut={amount}
          expiryValue={expiryValue}
          onClick={onClickSellBtn}
          isPriceReverse={false}
          onTradeSuccess={() => {
            setAmount('');
            setTotal('');
            setProgressValue(0);
          }}
        />
      </Col>
      {totalError.error && <DepositLink />}
    </Row>
  );
};
