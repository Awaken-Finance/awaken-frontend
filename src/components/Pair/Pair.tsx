import React, { useMemo } from 'react';

import { unifyWTokenSymbol } from 'utils';
import { TokenInfo } from 'types';

import Font from 'components/Font';

import { FontStyleProps } from 'utils/getFontStyle';

export interface PairProps extends FontStyleProps {
  symbol?: TokenInfo | string;
}

export default function Pair({ symbol, ...props }: PairProps) {
  const text = useMemo(() => {
    if (typeof symbol === 'string') {
      return symbol;
    }

    return unifyWTokenSymbol(symbol);
  }, [symbol]);

  return <Font {...props}>{text}</Font>;
}
