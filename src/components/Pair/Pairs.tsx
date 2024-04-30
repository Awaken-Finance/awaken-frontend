import React from 'react';

import { FontStyleProps } from 'utils/getFontStyle';
import Pair from './Pair';
import Font from 'components/Font';
import { TokenInfo } from 'types';
import { getPairsOrderByTokenWeights } from 'utils/pair';

export interface PairsProps extends FontStyleProps {
  tokenA?: TokenInfo | string;
  tokenB?: TokenInfo | string;
  delimiter?: string;
  maxLenth?: number;
}

export default function Pairs({ tokenA, tokenB, delimiter = '/', ...props }: PairsProps) {
  const tokens = getPairsOrderByTokenWeights(tokenA, tokenB);

  return (
    <span className="pairs">
      <Pair symbol={tokens[0] ?? '---'} {...props} />
      <Font {...props}>{delimiter}</Font>
      <Pair symbol={tokens[1] ?? '---'} {...props} />
    </span>
  );
}
