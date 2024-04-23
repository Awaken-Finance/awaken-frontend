import BigNumber from 'bignumber.js';
import { useMobile } from 'utils/isMobile';
import { formatPriceUSD } from 'utils/price';
import clsx from 'clsx';
import { CSSProperties } from 'react';
import { TSize } from 'types';
import './index.less';
import PriceUSDDecimalsSink from 'components/PriceUSDDecimalsSink';

export default function PriceUSDDigits({
  price,
  prefix = '$',
  suffix = '',
  className,
  wrapperClassName,
  style,
  size,
  isSink,
}: {
  price?: BigNumber.Value;
  prefix?: string;
  suffix?: string;
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
        <PriceUSDDecimalsSink prefix={prefix} suffix={suffix} price={price} className={className} />
      ) : (
        <span className={clsx('price-digits-inner', size && `price-digits-${size}`, className)}>
          {typeof price !== 'undefined' ? `${prefix}${formatPriceUSD(price)}${suffix}` : '-'}
        </span>
      )}
    </span>
  );
}
