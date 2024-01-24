import { useCallback, useRef } from 'react';
import BigNumber from 'bignumber.js';
import { useTranslation } from 'react-i18next';
import { Currency } from '@awaken/sdk-core';
import { isValidNumber } from 'utils/reg';
import { divDecimals } from 'utils/calculate';
import { parseInputChange } from 'utils';

import Font from 'components/Font';
import CommonInput from 'components/CommonInput';
import CommonTooltip from 'components/CommonTooltip';

import './index.less';

function InputAmount({
  onChange = () => null,
  onFocus,
  token,
  value = '',
  error = false,
  text = '',
  type = 'amount',
  disabled = false,
}: {
  onChange?: (val: string) => void;
  onFocus?: () => void;
  token?: Currency;
  value?: string;
  error: boolean;
  text?: string;
  type?: string;
  disabled?: boolean;
}) {
  const { t } = useTranslation();

  const min = useRef<BigNumber>(divDecimals('1', token?.decimals));

  const inputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.value && !isValidNumber(event.target.value)) {
        return;
      }

      onChange(parseInputChange(event.target.value, min.current, token?.decimals));
    },
    [token, onChange],
  );

  return (
    <CommonTooltip
      align={{
        offset: [-42, 4],
      }}
      visible={error}
      title={text}
      placement="topRight"
      useTooltip
      trigger=""
      arrowPointAtCenter={false}>
      <CommonInput
        className="input-price"
        prefix={
          <Font color="two" lineHeight={30}>
            {t(type)}
          </Font>
        }
        suffix={<Font lineHeight={30}>{token?.symbol || ''}</Font>}
        textAlign="right"
        onFocus={onFocus}
        onChange={(e) => {
          e.stopPropagation();
          inputChange(e);
        }}
        value={value}
        placeholder="0.00"
        status={error ? 'error' : ''}
        resumePositionOnBlur
        disabled={disabled}
      />
    </CommonTooltip>
  );
}

export default InputAmount;
