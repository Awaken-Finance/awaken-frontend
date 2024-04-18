import BigNumber from 'bignumber.js';
import clsx from 'clsx';
import { formatPriceSplit } from 'utils/price';
import './index.less';

import { CSSProperties } from 'react';
import { TSize } from 'types';

export interface PriceDecimalsSinkProps {
  price: BigNumber.Value;
  className?: string;
  style?: CSSProperties;
  prefix?: string;
  subfix?: string;
  size?: TSize;
}

export default function PriceDecimalsSinkProps({
  price,
  style,
  prefix = '',
  subfix = '',
  className,
  size,
}: PriceDecimalsSinkProps) {
  const { p, o, m } = formatPriceSplit(price);
  return (
    <span style={style} className={clsx('price-sink-wrapper', size && `price-sink-${size}`, className)}>
      <span className="price-start">{`${prefix}${p}`}</span>
      {o && <span className="price-hide-decimals">{o}</span>}
      {m && <span className="price-end">{`${m}${subfix}`}</span>}
    </span>
  );
}
