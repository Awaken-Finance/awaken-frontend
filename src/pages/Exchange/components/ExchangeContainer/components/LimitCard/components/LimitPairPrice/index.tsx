import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Currency } from '@awaken/sdk-core';
import { useTranslation } from 'react-i18next';

import Font from 'components/Font';

import { parseInputChange } from 'utils';
import './styles.less';
import { ONE, ZERO } from 'constants/misc';
import CommonTooltip from 'components/CommonTooltip';
import CommonInput from 'components/CommonInput';
import { isValidNumber } from 'utils/reg';
import { divDecimals } from 'utils/calculate';
import BigNumber from 'bignumber.js';
import { formatSymbol } from 'utils/token';
import { FontColor } from 'utils/getFontStyle';
import { LIMIT_MAX_BUFFER_RATIO, LIMIT_PRICE_DECIMAL } from 'constants/limit';

enum PriceBtnKeyEnum {
  market = 1,
  one,
  three,
  five,
}

type TPriceBtn = {
  label: string;
  value: number;
  key: PriceBtnKeyEnum;
};

const PRICE_BTN_LIST: TPriceBtn[] = [
  {
    label: 'Market',
    value: 0,
    key: PriceBtnKeyEnum.market,
  },
  {
    label: '1%',
    value: 0.01,
    key: PriceBtnKeyEnum.one,
  },
  {
    label: '3%',
    value: 0.03,
    key: PriceBtnKeyEnum.three,
  },
  {
    label: '5%',
    value: 0.05,
    key: PriceBtnKeyEnum.five,
  },
];

type TDiffPercentInfo = {
  color: FontColor;
  value: string;
  prefix: string;
};

export type TLimitPairPriceProps = {
  tokenIn?: Currency;
  tokenOut?: Currency;
  tokenOutMarketPrice: string;
  isReverseInit?: boolean;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  isZeroShow?: boolean;
};
export const LimitPairPrice = ({
  tokenIn,
  tokenOut,
  tokenOutMarketPrice,
  isReverseInit = false,
  onChange,
  onFocus,
  isZeroShow = false,
}: TLimitPairPriceProps) => {
  const { t } = useTranslation();

  // const [priceKey, setPriceKey] = useState(PriceBtnKeyEnum.market);
  const [isReverse, setIsReverse] = useState(isReverseInit);

  const [price, setPrice] = useState('');

  const setPriceValue = useCallback(
    (_priceKey: PriceBtnKeyEnum) => {
      console.log('tokenOutMarketPrice', tokenOutMarketPrice);
      const tokenOutMarketPriceBN = ZERO.plus(tokenOutMarketPrice);
      const priceBtn = PRICE_BTN_LIST.find((item) => item.key === _priceKey);
      let value = ZERO;
      const realValue = tokenOutMarketPriceBN.times(ONE.minus(priceBtn?.value || 0));

      if (!isReverse) {
        value = realValue.dp(LIMIT_PRICE_DECIMAL, BigNumber.ROUND_DOWN);
      } else {
        if (ZERO.eq(tokenOutMarketPrice)) value = ZERO;
        else
          value = ONE.div(tokenOutMarketPriceBN)
            .times(ONE.plus(priceBtn?.value || 0))
            .dp(LIMIT_PRICE_DECIMAL, BigNumber.ROUND_CEIL);
      }

      const valueStr = value.toFixed();
      setPrice(valueStr);

      return realValue.toFixed(LIMIT_PRICE_DECIMAL, BigNumber.ROUND_DOWN);
    },
    [isReverse, tokenOutMarketPrice],
  );
  const setPriceValueRef = useRef(setPriceValue);
  setPriceValueRef.current = setPriceValue;

  const isTokenAMarketPriceInitRef = useRef(false);
  useEffect(() => {
    if (isTokenAMarketPriceInitRef.current) return;
    if (ZERO.gte(tokenOutMarketPrice)) return;
    isTokenAMarketPriceInitRef.current = true;
    const value = setPriceValueRef.current(PriceBtnKeyEnum.market);
    onChange?.(value);
  }, [tokenOutMarketPrice, onChange]);

  useEffect(() => {
    const value = setPriceValueRef.current(PriceBtnKeyEnum.market);
    onChange?.(value);
  }, [isReverse, onChange]);

  useEffect(() => {
    const value = setPriceValue(PriceBtnKeyEnum.market);
    onChange?.(value);
  }, [onChange, setPriceValue]);

  const onClick = useCallback(
    (item: TPriceBtn) => {
      // setPriceKey(item.key);
      onChange?.(setPriceValue(item.key));
      onFocus?.();
    },
    [onChange, setPriceValue, onFocus],
  );

  const min = useRef<BigNumber>(divDecimals('1', LIMIT_PRICE_DECIMAL));
  const inputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.value && !isValidNumber(event.target.value)) {
        return;
      }

      const value = parseInputChange(event.target.value, min.current, LIMIT_PRICE_DECIMAL);
      setPrice(value);
      onChange?.(!isReverse ? value : ONE.div(value).toFixed(LIMIT_PRICE_DECIMAL));
    },
    [isReverse, onChange],
  );

  const amountError = useMemo(() => {
    if (isZeroShow && ZERO.gte(price)) {
      return {
        text: 'Please enter price',
        error: true,
      };
    }
    const tokenOutMarketPriceBN = ZERO.plus(tokenOutMarketPrice).dp(LIMIT_PRICE_DECIMAL, BigNumber.ROUND_FLOOR);

    const maxValue = tokenOutMarketPriceBN.times(LIMIT_MAX_BUFFER_RATIO).dp(LIMIT_PRICE_DECIMAL, BigNumber.ROUND_FLOOR);
    if (!isReverse) {
      if (maxValue.lt(price)) {
        return {
          text: `Your limit price is  higher than market,adjust your limit price to proceed.`,
          error: true,
        };
      }
    } else {
      const minValue = ONE.div(maxValue).dp(LIMIT_PRICE_DECIMAL, BigNumber.ROUND_CEIL);
      if (minValue.gt(price) && maxValue.gt(ZERO)) {
        return {
          text: minValue.toFixed(),
          error: true,
        };
      }
    }
    return {
      text: '',
      error: false,
    };
  }, [isReverse, isZeroShow, price, tokenOutMarketPrice]);

  const symbolStr = useMemo(
    () => formatSymbol(!isReverse ? tokenIn?.symbol : tokenOut?.symbol),
    [isReverse, tokenOut?.symbol, tokenIn?.symbol],
  );

  const diffPercentInfo: TDiffPercentInfo = useMemo(() => {
    const tokenOutMarketPriceBN = ZERO.plus(tokenOutMarketPrice);
    const marketPriceBN = !isReverse ? tokenOutMarketPriceBN : ONE.div(tokenOutMarketPriceBN);

    const diffPercent = ZERO.plus(price).div(marketPriceBN).minus(1);
    const isZero = diffPercent.dp(2, BigNumber.ROUND_HALF_CEIL).eq(ZERO);

    if (isZero || ZERO.eq(tokenOutMarketPrice)) {
      return {
        color: 'one',
        value: '0',
        prefix: '',
      };
    }
    const absPercentStr = diffPercent.abs().toFixed(2, BigNumber.ROUND_HALF_CEIL);
    if (ZERO.gt(diffPercent)) {
      return {
        color: 'fall',
        value: absPercentStr,
        prefix: '-',
      };
    }
    return {
      color: 'rise',
      value: absPercentStr,
      prefix: '+',
    };
  }, [isReverse, price, tokenOutMarketPrice]);

  return (
    <div className="limit-pair-price">
      <CommonTooltip
        align={{
          offset: [-42, 4],
        }}
        visible={amountError.error}
        title={amountError.text}
        placement="topRight"
        useTooltip
        trigger=""
        arrowPointAtCenter={false}>
        <CommonInput
          prefix={
            <Font color="two" lineHeight={30}>
              {t('Price')}
            </Font>
          }
          suffix={
            <div className="limit-pair-price-suffix">
              <Font color="one" lineHeight={30}>
                {symbolStr || ''}
              </Font>
              <div className="limit-price-btn-area">
                {PRICE_BTN_LIST.map((item) => (
                  <div
                    key={item.label}
                    // className={clsx(['limit-price-btn', priceKey === item.key && 'limit-price-btn-active'])}
                    className="limit-price-btn"
                    onClick={() => {
                      onClick(item);
                    }}>
                    <Font size={12} color="one">
                      {`${item.key !== PriceBtnKeyEnum.market ? (!isReverse ? '-' : '+') : ''}${item.label}`}
                    </Font>
                  </div>
                ))}
                <div className="limit-price-diff">
                  <Font size={12} color={diffPercentInfo.color}>
                    {`${diffPercentInfo.prefix}${diffPercentInfo.value}%`}
                  </Font>
                </div>
              </div>
            </div>
          }
          textAlign="right"
          onChange={(e) => {
            e.stopPropagation();
            inputChange(e);
          }}
          onFocus={onFocus}
          value={price}
          placeholder="0.00"
          status={amountError.error ? 'error' : ''}
          resumePositionOnBlur
        />
      </CommonTooltip>
    </div>
  );
};
