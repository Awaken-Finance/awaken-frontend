import BigNumber from 'bignumber.js';
import PriceDecimalsSinkProps from 'components/PriceDecimalsSinkProps';
import { useMobile } from 'utils/isMobile';
import { formatPrice } from 'utils/price';
import clsx from 'clsx';
import { CSSProperties } from 'react';
import { TSize } from 'types';
import './index.less';

export default function PriceDigits({
  price,
  prefix = '',
  subfix = '',
  className,
  wrapperClassName,
  style,
  size,
  isSink,
}: {
  price: BigNumber.Value;
  prefix?: string;
  subfix?: string;
  className?: string;
  wrapperClassName?: string;
  style?: CSSProperties;
  size?: TSize;
  isSink?: boolean;
}) {
  const isMobile = useMobile();
  return (
    <span style={style} className={clsx('price-digits-wrapper', wrapperClassName)}>
      {isMobile || isSink ? (
        <PriceDecimalsSinkProps prefix={prefix} subfix={subfix} price={price} className={className} />
      ) : (
        <span
          className={clsx('price-digits-inner', size && `price-digits-${size}`, className)}>{`${prefix}${formatPrice(
          price,
        )}${subfix}`}</span>
      )}
    </span>
  );
}
