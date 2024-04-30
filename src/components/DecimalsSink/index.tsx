import clsx from 'clsx';
import './index.less';

import { CSSProperties } from 'react';
import { TSize } from 'types';

export interface IBaseDecimalsSinkProps {
  className?: string;
  style?: CSSProperties;
  prefix?: string;
  suffix?: string;
  size?: TSize;
}

export interface IDecimalsSinkProps extends IBaseDecimalsSinkProps {
  p?: string;
  o?: string;
  m?: string;
}

export default function DecimalsSink({
  style,
  prefix = '',
  suffix = '',
  className,
  size,
  p,
  o,
  m,
}: IDecimalsSinkProps) {
  return (
    <span style={style} className={clsx('price-sink-wrapper', size && `price-sink-${size}`, className)}>
      {p ? <span className="price-start">{`${prefix}${p}`}</span> : '-'}
      {o && <span className="price-hide-decimals">{o}</span>}
      {<span className="price-end">{m ? `${m}${suffix}` : suffix}</span>}
    </span>
  );
}
