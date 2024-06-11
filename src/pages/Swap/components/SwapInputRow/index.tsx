import { useCallback, useRef, useMemo } from 'react';
import BigNumber from 'bignumber.js';
import { Col, InputProps, InputRef, Row } from 'antd';

import { Currency } from '@awaken/sdk-core';
import { CurrencyLogo } from 'components/CurrencyLogo';
import { parseInputChange, unitConverter } from 'utils';
import { useTranslation } from 'react-i18next';
import { useTokenPrice } from 'contexts/useTokenPrice/hooks';
import { isValidNumber } from 'utils/reg';
import { divDecimals } from 'utils/calculate';

import { Pair } from 'components/Pair';
import CommonInput from 'components/CommonInput';
import Font from 'components/Font';
import { ZERO } from 'constants/misc';

import './styles.less';
import PriceUSDDigits from 'components/PriceUSDDigits';
import getFontStyle from 'utils/getFontStyle';

interface Props extends Omit<InputProps, 'onChange'> {
  token?: Currency;
  tokens?: { currency?: Currency }[];
  balance?: BigNumber;
  hideUSD?: boolean;
  maxCallback?: (val: string) => void;
  onChange?: (val: string) => void;
  suffix?: React.ReactNode | string | undefined;
  hidBlance?: boolean;
  value?: string;
  showMax?: boolean;
  gasFee?: string | number;
}
export default function SwapInputRow(props: Props) {
  const {
    token,
    onChange,
    value,
    placeholder = '0.00',
    suffix = '',
    hideUSD = false,
    hidBlance = false,
    disabled = false,
    balance,
    showMax = false,
    maxCallback = () => null,
    gasFee,
  } = props;
  const { t } = useTranslation();

  const inputRef = useRef<InputRef>(null);

  const tokenPrice = useTokenPrice({
    symbol: token?.symbol,
  });

  const displayBalance = useMemo(() => {
    if (!balance) return '-';
    return unitConverter(divDecimals(balance || ZERO, token?.decimals), 8);
  }, [balance, token?.decimals]);

  const min = useRef<BigNumber>(divDecimals('1', token?.decimals));

  const setValue = useCallback(
    (_value: string) => {
      onChange && onChange(parseInputChange(_value, min.current, token?.decimals));
    },
    [token, onChange],
  );

  const onInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.value && !isValidNumber(event.target.value)) {
        return;
      }
      setValue(event.target.value);
    },
    [setValue],
  );

  const renderUsd = useMemo(() => {
    if (value === undefined || value === '')
      return (
        <Font size={14} color="two">
          -
        </Font>
      );

    return (
      <PriceUSDDigits className={getFontStyle({ size: 14, color: 'two' })} price={ZERO.plus(value).times(tokenPrice)} />
    );
  }, [value, tokenPrice]);

  const onMax = useCallback(() => {
    if (token?.symbol === 'ELF' && gasFee && balance) {
      setValue(divDecimals(balance.minus(gasFee), token?.decimals).toFixed() || '');
      return;
    }
    setValue(divDecimals(balance || ZERO, token?.decimals).toFixed() || '');
  }, [balance, gasFee, setValue, token?.decimals, token?.symbol]);

  return (
    <Row gutter={[0, 12]} justify="space-between" className="swap-input-row" onClick={() => inputRef.current?.focus()}>
      <Col span={24}>
        <CommonInput
          suffix={suffix}
          onChange={onInputChange}
          value={value ?? ''}
          placeholder={placeholder}
          className="swap-input"
          disabled={!token || disabled}
          ref={inputRef}
        />
      </Col>
      <Col>{!hideUSD && renderUsd}</Col>
      <Col>
        {!hidBlance && (
          <div className="blance-box">
            <Font size={14} color="two" lineHeight={20}>
              {`${t('balance')}：${displayBalance}`}
            </Font>
            {showMax && (
              <div className="max-btn" onClick={onMax}>
                MAX
              </div>
            )}
          </div>
        )}
      </Col>
    </Row>
  );
}
