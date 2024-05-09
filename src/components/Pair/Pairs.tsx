import React, { useMemo } from 'react';

import { FontStyleProps } from 'utils/getFontStyle';
import Pair from './Pair';
import Font from 'components/Font';
import { TokenInfo } from 'types';
import { getPairsOrderByTokenWeights } from 'utils/pair';

export interface PairsProps extends FontStyleProps {
  tokenA?: TokenInfo | string;
  tokenB?: TokenInfo | string;
  delimiter?: string;
  maxLength?: number;
  isAutoOrder?: boolean;
}

export default function Pairs({ tokenA, tokenB, isAutoOrder = true, delimiter = '/', ...props }: PairsProps) {
  const tokens = useMemo(() => {
    if (!isAutoOrder) return [tokenA, tokenB];
    return getPairsOrderByTokenWeights(tokenA, tokenB);
  }, [isAutoOrder, tokenA, tokenB]);

  return (
    <span className="pairs">
      <Pair symbol={tokens[0] ?? '---'} {...props} />
      <Font {...props}>{delimiter}</Font>
      <Pair symbol={tokens[1] ?? '---'} {...props} />
    </span>
  );
}
