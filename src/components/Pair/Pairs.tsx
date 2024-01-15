import React from 'react';

import { FontStyleProps } from 'utils/getFontStyle';
import Pair from './Pair';
import Font from 'components/Font';

import { TokenInfo } from 'types';

export interface PairsProps extends FontStyleProps {
  tokenA?: TokenInfo | string;
  tokenB?: TokenInfo | string;
  delimiter?: string;
}

export default function Pairs({ tokenA = '', tokenB = '', delimiter = '/', ...props }: PairsProps) {
  return (
    <span>
      <Pair symbol={tokenA} {...props} />
      <Font {...props}>{delimiter}</Font>
      <Pair symbol={tokenB} {...props} />
    </span>
  );
}
