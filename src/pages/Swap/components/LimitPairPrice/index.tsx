import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
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
import { TReserveInfo } from 'hooks/limit';
import { getPairTokenRatio } from 'utils/swap';
import clsx from 'clsx';
import { CurrencyLogo } from 'components/CurrencyLogo';
import { IconSwitchPair2 } from 'assets/icons';
import { useMobile } from 'utils/isMobile';

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
    label: 'marketPrice',
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

export type TLimitPairPriceError = {
  text: string;
  btnText: string;
  error: boolean;
};

export interface ILimitPairPrice {
  reset: () => void;
}

export type TLimitPairPriceProps = {
  tokenIn?: Currency;
  tokenOut?: Currency;
  reserve?: TReserveInfo;
  isReverseInit?: boolean;
  onChange?: (value: string, isReverse: boolean) => void;
  onFocus?: () => void;
  isZeroShow?: boolean;
  isSwap?: boolean;
  onErrorChange?: (error: TLimitPairPriceError) => void;
};

export const LimitPairPrice = forwardRef(
  (
    {
      tokenIn,
      tokenOut,
      reserve,
      isReverseInit = false,
      onChange,
      onFocus,
      isZeroShow = false,
      isSwap = true,
      onErrorChange,
    }: TLimitPairPriceProps,
    ref,
  ) => {
    const { t } = useTranslation();
    const isMobile = useMobile();

    // const [priceKey, setPriceKey] = useState(PriceBtnKeyEnum.market);
    const [isReverse, setIsReverse] = useState(isReverseInit);
    const isReverseRef = useRef(isReverse);
    isReverseRef.current = isReverse;

    const tokenOutMarketPrice = useMemo(() => {
      return ZERO.plus(
        getPairTokenRatio({
          tokenA: tokenOut,
          tokenB: tokenIn,
          reserves: {
            [tokenOut?.symbol || '']: reserve?.reserveOut || '0',
            [tokenIn?.symbol || '']: reserve?.reserveIn || '0',
          },
        }),
      ).toFixed();
    }, [reserve?.reserveIn, reserve?.reserveOut, tokenIn, tokenOut]);
    const tokenOutMarketPriceRef = useRef(tokenOutMarketPrice);
    tokenOutMarketPriceRef.current = tokenOutMarketPrice;

    const [price, setPrice] = useState('');

    const refreshPriceValue = useCallback(
      (_priceKey: PriceBtnKeyEnum) => {
        console.log('tokenOutMarketPrice change', tokenOutMarketPrice, isReverse);

        const tokenOutMarketPriceBN = ZERO.plus(tokenOutMarketPrice);
        const priceBtn = PRICE_BTN_LIST.find((item) => item.key === _priceKey);
        let value = ZERO;
        const realValue = tokenOutMarketPriceBN.times(ONE.minus(priceBtn?.value || 0));

        if (!isReverse) {
          value = realValue.dp(LIMIT_PRICE_DECIMAL, BigNumber.ROUND_DOWN);
        } else {
          if (ZERO.eq(tokenOutMarketPriceBN)) value = ZERO;
          else
            value = ONE.div(tokenOutMarketPriceBN)
              .times(ONE.plus(priceBtn?.value || 0))
              .dp(LIMIT_PRICE_DECIMAL, BigNumber.ROUND_CEIL);
        }

        const valueStr = value.toFixed();
        setPrice(valueStr);

        return valueStr;
      },
      [isReverse, tokenOutMarketPrice],
    );
    const refreshPriceValueRef = useRef(refreshPriceValue);
    refreshPriceValueRef.current = refreshPriceValue;

    const isTokenAMarketPriceInitRef = useRef(false);
    useEffect(() => {
      if (!isTokenAMarketPriceInitRef.current) return;
      console.log('LimitPairPrice value change', isReverse, tokenOutMarketPrice, isTokenAMarketPriceInitRef.current);
      const value = refreshPriceValueRef.current(PriceBtnKeyEnum.market);
      onChange?.(value, isReverseRef.current);
    }, [onChange, isReverse, tokenOutMarketPrice]);

    useEffect(() => {
      if (isTokenAMarketPriceInitRef.current) return;
      if (ZERO.gte(tokenOutMarketPrice)) return;
      isTokenAMarketPriceInitRef.current = true;
      console.log('LimitPairPrice init', tokenOutMarketPrice);
      const value = refreshPriceValueRef.current(PriceBtnKeyEnum.market);
      onChange?.(value, isReverseRef.current);
    }, [tokenOutMarketPrice, onChange]);

    const onClick = useCallback(
      (item: TPriceBtn) => {
        // setPriceKey(item.key);
        console.log('LimitPairPrice onClick');
        onChange?.(refreshPriceValueRef.current(item.key), isReverseRef.current);
        onFocus?.();
      },
      [onChange, onFocus],
    );

    const min = useRef<BigNumber>(divDecimals('1', LIMIT_PRICE_DECIMAL));
    const inputChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.value && !isValidNumber(event.target.value)) {
          return;
        }

        const value = parseInputChange(event.target.value, min.current, LIMIT_PRICE_DECIMAL);
        setPrice(value);
        onChange?.(
          // !isReverse ? value : ONE.div(value).toFixed(LIMIT_PRICE_DECIMAL, BigNumber.ROUND_FLOOR),
          value,
          isReverseRef.current,
        );
      },
      [onChange],
    );

    const amountError = useMemo<TLimitPairPriceError>(() => {
      if (isZeroShow && ZERO.gte(price)) {
        return {
          text: '',
          btnText: t('Please enter a price'),
          error: true,
        };
      }

      const tokenOutMarketPriceBN = ZERO.plus(tokenOutMarketPriceRef.current).dp(
        LIMIT_PRICE_DECIMAL,
        BigNumber.ROUND_FLOOR,
      );
      const _isReverse = isReverseRef.current;

      const maxValue = tokenOutMarketPriceBN
        .times(LIMIT_MAX_BUFFER_RATIO)
        .dp(LIMIT_PRICE_DECIMAL, BigNumber.ROUND_FLOOR);
      if (!_isReverse) {
        if (maxValue.lt(price)) {
          return {
            text: t(`limitHighPriceDescription`),
            btnText: t('limitHighPriceBtnText'),
            error: true,
          };
        }
      } else {
        const minValue = ONE.div(maxValue).dp(LIMIT_PRICE_DECIMAL, BigNumber.ROUND_CEIL);
        if (minValue.gt(price) && maxValue.gt(ZERO)) {
          return {
            text: t('limitLowPriceDescription'),
            btnText: t('limitLowPriceBtnText'),
            error: true,
          };
        }
      }
      return {
        text: '',
        btnText: '',
        error: false,
      };
    }, [isZeroShow, price, t]);
    useEffect(() => {
      onErrorChange?.(amountError);
    }, [amountError, onErrorChange]);

    const symbolAStr = useMemo(
      () => formatSymbol(!isReverse ? tokenOut?.symbol : tokenIn?.symbol),
      [isReverse, tokenOut?.symbol, tokenIn?.symbol],
    );

    const symbolBStr = useMemo(
      () => formatSymbol(!isReverse ? tokenIn?.symbol : tokenOut?.symbol),
      [isReverse, tokenOut?.symbol, tokenIn?.symbol],
    );

    const diffPercentInfo: TDiffPercentInfo = useMemo(() => {
      if (!price || ZERO.eq(price)) {
        return {
          color: 'one',
          value: '-',
          prefix: '',
        };
      }
      const _isReverse = isReverseRef.current;
      const tokenOutMarketPriceBN = ZERO.plus(tokenOutMarketPriceRef.current);
      const marketPriceBN = !_isReverse ? tokenOutMarketPriceBN : ONE.div(tokenOutMarketPriceBN);

      const diffPercent = ZERO.plus(price).div(marketPriceBN).minus(1);
      const isZero = diffPercent.dp(2, BigNumber.ROUND_HALF_CEIL).eq(ZERO);

      if (isZero || ZERO.eq(tokenOutMarketPriceBN)) {
        return {
          color: 'one',
          value: '0%',
          prefix: '',
        };
      }
      const absPercentStr = `${diffPercent.abs().times(100).toFixed(2, BigNumber.ROUND_HALF_CEIL)}%`;
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
    }, [price]);

    const reset = useCallback(async () => {
      isTokenAMarketPriceInitRef.current = false;
      setPrice('');
    }, []);
    useImperativeHandle(ref, () => ({ reset }));

    const switchReverse = useCallback(() => {
      setIsReverse((pre) => !pre);
    }, []);

    return (
      <div className={clsx(['limit-pair-price', isSwap && 'limit-pair-price-swap'])}>
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
              <div className="limit-pair-price-prefix">
                {!isSwap && (
                  <Font color="two" lineHeight={30}>
                    {t('Price')}
                  </Font>
                )}
                <div className="limit-pair-price-header">
                  <div className="limit-pair-price-header-left">
                    <Font size={14} color="two">
                      {t('When')}
                    </Font>
                    <div className="limit-pair-price-header-unit">
                      <CurrencyLogo size={16} currency={!isReverse ? tokenOut : tokenIn} />
                      <Font size={14}>{`1 ${symbolAStr}`}</Font>
                    </div>
                    <Font size={14} color="two">
                      {t('is worth')}
                    </Font>
                  </div>
                  <IconSwitchPair2 className="limit-pair-price-switch" onClick={switchReverse} />
                </div>
              </div>
            }
            suffix={
              <div className="limit-pair-price-suffix">
                <div className="limit-pair-price-suffix-token">
                  {isSwap && <CurrencyLogo size={isMobile ? 16 : 24} currency={!isReverse ? tokenIn : tokenOut} />}
                  <Font color="one" size={isMobile ? 16 : 20} lineHeight={isMobile ? 22 : 24} weight="medium">
                    {symbolBStr || ''}
                  </Font>
                </div>

                <div className="limit-price-btn-area">
                  {isSwap && (
                    <div className="limit-price-diff">
                      <Font size={12} color={diffPercentInfo.color}>
                        {`${diffPercentInfo.prefix}${diffPercentInfo.value}`}
                      </Font>
                    </div>
                  )}
                  {PRICE_BTN_LIST.map((item) => (
                    <div
                      key={item.label}
                      // className={clsx(['limit-price-btn', priceKey === item.key && 'limit-price-btn-active'])}
                      className="limit-price-btn"
                      onClick={() => {
                        onClick(item);
                      }}>
                      <Font size={12} color="one">
                        {`${item.key !== PriceBtnKeyEnum.market ? (!isReverse ? '-' : '+') : ''}${t(item.label)}`}
                      </Font>
                    </div>
                  ))}
                  {!isSwap && (
                    <div className="limit-price-diff">
                      <Font size={12} color={diffPercentInfo.color}>
                        {`${diffPercentInfo.prefix}${diffPercentInfo.value}`}
                      </Font>
                    </div>
                  )}
                </div>
              </div>
            }
            textAlign={isSwap ? 'left' : 'right'}
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
  },
);
