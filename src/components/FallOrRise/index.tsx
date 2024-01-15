import React, { useMemo } from 'react';

import BigNumber from 'bignumber.js';

import Font, { FontProps } from 'components/Font';
import { FontColor } from 'utils/getFontStyle';

interface FallOrRiseProps extends FontProps {
  num: number | string | BigNumber;
  displayNum?: string | undefined;
  usePrefix?: boolean;
  useSubfix?: boolean;
  status?: number;
}

export default function FallOrRise({
  num,
  displayNum = undefined,
  usePrefix = true,
  useSubfix = true,
  status,
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

  return (
    <Font prefix={`${usePrefix ? style[0] : ''}`} subfix={`${useSubfix ? '%' : ''}`} color={style[1]} {...props}>
      {displayNum || num}
    </Font>
  );
}
