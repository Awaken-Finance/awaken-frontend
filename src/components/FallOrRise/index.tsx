import { useMemo } from 'react';

import BigNumber from 'bignumber.js';

import Font, { FontProps } from 'components/Font';
import getFontStyle, { FontColor } from 'utils/getFontStyle';
import PriceDigits from 'components/PriceDigits';

interface FallOrRiseProps extends FontProps {
  num: number | string | BigNumber;
  displayNum?: string | undefined;
  usePrefix?: boolean;
  useSubfix?: boolean;
  status?: number;
  isPrice?: boolean;
}

export default function FallOrRise({
  num,
  displayNum = undefined,
  usePrefix = true,
  useSubfix = true,
  status,
  isPrice,
  ...props
}: FallOrRiseProps) {
  const style = useMemo((): [string, FontColor] => {
    const temp = typeof status !== 'undefined' ? status : num;

    const bigNum = new BigNumber(temp);
    if (bigNum.gt(0)) {
      return ['+', 'rise'];
    }
    if (bigNum.lt(0)) {
      return ['', 'fall'];
    }
    return ['', 'two'];
  }, [num, status]);

  const prefix = useMemo(() => `${usePrefix ? style[0] : ''}`, [style, usePrefix]);
  const subfix = useMemo(() => `${useSubfix ? '%' : ''}`, [useSubfix]);
  const color = useMemo(() => style[1], [style]);

  return isPrice ? (
    <PriceDigits price={num} prefix={prefix} subfix={subfix} className={getFontStyle({ ...props, color })} />
  ) : (
    <Font prefix={prefix} subfix={subfix} color={color} {...props}>
      {displayNum || num}
    </Font>
  );
}
