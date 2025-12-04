import BigNumber from 'bignumber.js';
import PriceDecimalsSink from 'components/PriceDecimalsSink';
import { useMobile } from 'utils/isMobile';
import { formatPrice, showValueWrapper } from 'utils/price';
import clsx from 'clsx';
import { CSSProperties } from 'react';
import { TSize } from 'types';
import './index.less';

export default function PriceDigits({
  price,
  prefix = '',
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
        <PriceDecimalsSink prefix={prefix} suffix={suffix} price={price} className={className} />
      ) : (
        <span className={clsx('price-digits-inner', size && `price-digits-${size}`, className)}>
          {showValueWrapper(price, `${prefix}${formatPrice(price)}${suffix}`)}
        </span>
      )}
    </span>
  );
}
