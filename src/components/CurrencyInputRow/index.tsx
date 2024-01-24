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
import { formatPriceUSDWithSymBol } from 'utils/price';

import './styles.less';

interface Props extends Omit<InputProps, 'onChange'> {
  token?: Currency;
  tokens?: { currency?: Currency }[];
  balance?: BigNumber;
  hideUSD?: boolean;
  referToken?: Currency;
  maxCallback?: () => void;
  onChange?: (val: string) => void;
  suffix?: React.ReactNode | string | undefined;
  hidBlance?: boolean;
  value?: string;
  showMax?: boolean;
}
export default function CurrencyInputRow(props: Props) {
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
  } = props;
  const { t } = useTranslation();

  const inputRef = useRef<InputRef>(null);

  const tokenPrice = useTokenPrice({
    symbol: token?.symbol,
  });

  const displayBalance = useMemo(() => divDecimals(balance || ZERO, token?.decimals), [balance, token?.decimals]);

  const min = useRef<BigNumber>(divDecimals('1', token?.decimals));

  const renderSuffix = useMemo(() => {
    if (suffix) {
      return suffix;
    }

    return (
      <Row gutter={[6, 0]}>
        <Col>{token && <CurrencyLogo size={24} currency={token} />}</Col>
        <Col>
          {!token ? (
            <Font size={20} lineHeight={24} weight="medium">
              {t('selectAToken')}
            </Font>
          ) : (
            <Pair symbol={token?.symbol} size={20} lineHeight={24} weight="medium" />
          )}
        </Col>
      </Row>
    );
  }, [suffix, token, t]);

  const inputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.value && !isValidNumber(event.target.value)) {
        return;
      }

      onChange && onChange(parseInputChange(event.target.value, min.current, token?.decimals));
    },
    [token, onChange],
  );

  const renderUsd = useMemo(() => {
    if (value === undefined || value === '') {
      return '-';
    }

    return formatPriceUSDWithSymBol(new BigNumber(value).times(tokenPrice));
  }, [value, tokenPrice]);

  return (
    <Row
      gutter={[0, 12]}
      justify="space-between"
      className="currency-input-row"
      onClick={() => inputRef.current?.focus()}>
      <Col span={24}>
        <CommonInput
          suffix={renderSuffix}
          onChange={inputChange}
          value={value ?? ''}
          placeholder={placeholder}
          className="currency-input"
          disabled={!token || disabled}
          ref={inputRef}
        />
      </Col>
      <Col>
        {!hideUSD && token && (
          <Font size={14} color="two">
            {renderUsd}
          </Font>
        )}
      </Col>
      <Col>
        {!hidBlance && token && (
          <div className="blance-box">
            <Font size={14} color="two" lineHeight={20}>
              {`${t('balance')}：${unitConverter(displayBalance, 8)}`}
            </Font>
            {showMax && (
              <div className="max-btn" onClick={maxCallback}>
                MAX
              </div>
            )}
          </div>
        )}
      </Col>
    </Row>
  );
}
