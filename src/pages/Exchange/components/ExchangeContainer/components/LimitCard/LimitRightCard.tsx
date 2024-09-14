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
import { useTransactionFee } from 'contexts/useStore/hooks';
import { LimitSellBtnWithPay } from 'Buttons/LimitSellBtn';
import { FeeRow } from 'pages/Swap/components/FeeRow';
import { LimitPairPrice } from 'pages/Swap/components/LimitPairPrice';
import { LIMIT_LABS_FEE_RATE, LIMIT_RECEIVE_RATE } from 'constants/swap';
import { DepositLink } from 'components/DepositLink';

export type TLimitRightCardProps = {
  rate: string;
  tokenA?: Currency;
  tokenB?: Currency;
  balances?: CurrencyBalances;
  reserves?: Reserves;
};

export const LimitRightCard = ({ tokenA, tokenB, balances, reserves, rate }: TLimitRightCardProps) => {
  const isMobile = useMobile();
  const balance = balances?.[getCurrencyAddress(tokenA)];
  const transactionFee = useTransactionFee();

  const [amount, setAmount] = useState('');
  const [total, setTotal] = useState('');
  const [isAmountZeroShow, setIsAmountZeroShow] = useState(false);
  const [isTotalZeroShow, setIsTotalZeroShow] = useState(false);
  const [isPriceZeroShow, setIsPriceZeroShow] = useState(false);
  const [tokenBPrice, setTokenBPrice] = useState('0');
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
      reserveIn: reserves[tokenA?.symbol || ''],
      reserveOut: reserves[tokenB?.symbol || ''],
    };
  }, [reserves, tokenA?.symbol, tokenB?.symbol]);

  const maxBalanceAmount = useMemo(() => {
    if (tokenA?.symbol === 'ELF' && balance?.gt(transactionFee)) {
      return divDecimals(balance?.minus(transactionFee), tokenA?.decimals);
    }
    return divDecimals(balance, tokenA?.decimals);
  }, [balance, tokenA, transactionFee]);

  const maxTotal = useMemo(() => {
    if (ZERO.gte(tokenBPrice) || !tokenBPrice) return ZERO;
    return maxBalanceAmount
      .times(tokenBPrice)
      .times(LIMIT_RECEIVE_RATE)
      .dp(tokenB?.decimals || 0, BigNumber.ROUND_FLOOR);
  }, [tokenBPrice, maxBalanceAmount, tokenB?.decimals]);

  const [progressValue, setProgressValue] = useState(0);
  const sliderValue = useMemo(() => +inputToSide(amount, maxBalanceAmount).toFixed(0), [amount, maxBalanceAmount]);

  const amountError = useMemo(() => {
    const bigInput = new BigNumber(amount);

    if (isAmountZeroShow && (bigInput.isNaN() || bigInput.lte(0))) {
      return {
        text: 'Please enter amount',
        error: true,
      };
    }

    if (bigInput.gt(maxBalanceAmount)) {
      return {
        text: `Max amount ${maxBalanceAmount} ${formatSymbol(tokenA?.symbol)}`,
        error: true,
      };
    }

    return {
      text: '',
      error: false,
    };
  }, [amount, isAmountZeroShow, maxBalanceAmount, tokenA?.symbol]);

  const totalError = useMemo(() => {
    const bigTotal = new BigNumber(total);

    if (isTotalZeroShow && (bigTotal.isNaN() || bigTotal.lte(0))) {
      return {
        text: 'Please enter total',
        error: true,
      };
    }

    if (bigTotal.gt(maxTotal)) {
      return {
        text: `Max output ${bigNumberToString(maxTotal, tokenB?.decimals)} ${formatSymbol(tokenB?.symbol)}`,
        error: true,
      };
    }

    return {
      text: '',
      error: false,
    };
  }, [isTotalZeroShow, maxTotal, tokenB?.decimals, tokenB?.symbol, total]);

  const inputAmount = useCallback(
    (val: string, _tokenBPrice?: string) => {
      setIsAmountFocus(true);
      const price = _tokenBPrice ?? tokenBPrice;
      if (ZERO.gte(price) || !price) {
        setTotal('');
        setAmount(val);
        setProgressValue(0);
        return;
      }
      let totalStr = '';
      if (val) {
        totalStr = ZERO.plus(val)
          .times(price)
          .times(LIMIT_RECEIVE_RATE)
          .dp(tokenB?.decimals || 0, BigNumber.ROUND_FLOOR)
          .toFixed();
      }
      setTotal(totalStr);
      setAmount(val);
      setProgressValue(0);
    },
    [tokenBPrice, tokenB?.decimals],
  );

  const inputTotal = useCallback(
    (val: string, _tokenBPrice?: string) => {
      setIsAmountFocus(false);
      const price = _tokenBPrice ?? tokenBPrice;
      if (ZERO.gte(price) || !price) {
        setAmount('');
        setTotal(val);
        setProgressValue(0);
        return;
      }
      let amountStr = '';
      if (val) {
        const realVal = ZERO.plus(val)
          .div(LIMIT_RECEIVE_RATE)
          .dp(tokenA?.decimals || 0);
        amountStr = realVal
          .div(price)
          .dp(tokenA?.decimals || 0, BigNumber.ROUND_CEIL)
          .toFixed();
      }

      setAmount(amountStr);
      setTotal(val);
      setProgressValue(0);
    },
    [tokenA?.decimals, tokenBPrice],
  );

  const sliderAmount = useCallback(
    (val: number) => {
      setIsAmountFocus(true);
      if (ZERO.isEqualTo(val)) {
        setAmount('');
        setTotal('');
        setProgressValue(0);
        return;
      }

      const newAmount = sideToInput(val, maxBalanceAmount);
      const newAmountStr = bigNumberToString(newAmount, tokenA?.decimals);
      const newTotal = ZERO.plus(newAmountStr)
        .times(tokenBPrice)
        .times(LIMIT_RECEIVE_RATE)
        .dp(tokenB?.decimals || 0, BigNumber.ROUND_FLOOR)
        .toFixed();

      setTotal(newTotal);
      setAmount(newAmountStr);
      setProgressValue(newAmount.isNaN() || newAmount.lte(0) ? 0 : val);
    },
    [maxBalanceAmount, tokenA?.decimals, tokenBPrice, tokenB?.decimals],
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
    setTokenBPrice(value);
    refreshValueRef.current(value);
  }, []);

  const onClickSellBtn = () => {
    setIsAmountZeroShow(!amount);
    setIsTotalZeroShow(!total);
    setIsPriceZeroShow(!tokenBPrice);
  };

  const limitFeeValue = useMemo(() => {
    if (!total) return '-';
    return ZERO.plus(total)
      .div(LIMIT_RECEIVE_RATE)
      .times(LIMIT_LABS_FEE_RATE)
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
            <LimitPairPrice
              tokenIn={tokenA}
              tokenOut={tokenB}
              reserve={reserve}
              onChange={onPairPriceChange}
              onFocus={() => setIsPriceZeroShow(false)}
              isZeroShow={isPriceZeroShow}
              isReverseInit={true}
              isSwap={false}
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
            <LimitMaxValue isBuy={false} token={tokenB} value={maxTotal} />
          </Col>
          <Col span={24}>
            <LimitExpiry value={expiryValue} onChange={setExpiryValue} />
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
        <LimitSellBtnWithPay
          sell
          disabled={amountError.error || totalError.error}
          tokenIn={tokenA}
          tokenOut={tokenB}
          amountIn={amount}
          amountOut={total}
          expiryValue={expiryValue}
          onClick={onClickSellBtn}
          isPriceReverse={true}
          onTradeSuccess={() => {
            setAmount('');
            setTotal('');
            setProgressValue(0);
          }}
        />
      </Col>
      {amountError.error && <DepositLink receiveToken={tokenA?.symbol} />}
    </Row>
  );
};
