import { useMemo } from 'react';

import BigNumber from 'bignumber.js';

import Font, { FontProps } from 'components/Font';
import getFontStyle, { FontColor } from 'utils/getFontStyle';
import PriceDigits from 'components/PriceDigits';

interface FallOrRiseProps extends FontProps {
  num?: number | string | BigNumber;
  displayNum?: string | undefined;
  usePrefix?: boolean;
  useSuffix?: boolean;
  status?: number;
  isPrice?: boolean;
}

export default function FallOrRise({
  num,
  displayNum = undefined,
  usePrefix = true,
  useSuffix = true,
  status,
  isPrice,
  ...props
}: FallOrRiseProps) {
  const style = useMemo((): [string, FontColor] => {
    const temp = typeof status !== 'undefined' ? status : num;

    const bigNum = new BigNumber(temp ?? 0);
    if (bigNum.gt(0)) {
      return ['+', 'rise'];
    }
    if (bigNum.lt(0)) {
      return ['', 'fall'];
    }
    return ['', 'two'];
  }, [num, status]);

  const prefix = useMemo(() => `${usePrefix ? style[0] : ''}`, [style, usePrefix]);
  const suffix = useMemo(() => `${useSuffix && num ? '%' : ''}`, [num, useSuffix]);
  const color = useMemo(() => style[1], [style]);

  return isPrice ? (
    <PriceDigits price={num} prefix={prefix} suffix={suffix} className={getFontStyle({ ...props, color })} />
  ) : (
    <Font prefix={prefix} suffix={suffix} color={color} {...props}>
      {(displayNum || num) ?? '--'}
    </Font>
  );
}
