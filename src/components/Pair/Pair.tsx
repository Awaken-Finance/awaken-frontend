import React, { useMemo } from 'react';

import { unifyWTokenSymbol } from 'utils';
import { TokenInfo } from 'types';

import Font from 'components/Font';
import { stringCut } from 'utils/string';
import { FontStyleProps } from 'utils/getFontStyle';

export interface PairProps extends FontStyleProps {
  symbol?: TokenInfo | string;
  maxLength?: number;
}

export default function Pair({ symbol, maxLength, ...props }: PairProps) {
  const text = useMemo(() => {
    if (!symbol) return '--';
    const symbolStr = typeof symbol === 'string' ? symbol : unifyWTokenSymbol(symbol);
    return stringCut(symbolStr, maxLength ?? symbolStr.length);
  }, [maxLength, symbol]);

  return <Font {...props}>{text}</Font>;
}
