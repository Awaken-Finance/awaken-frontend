import BigNumber from 'bignumber.js';
import { useMobile } from 'utils/isMobile';
import { formatPriceUSD } from 'utils/price';
import clsx from 'clsx';
import { CSSProperties, useMemo } from 'react';
import { TSize } from 'types';
import './index.less';
import PriceUSDDecimalsSink from 'components/PriceUSDDecimalsSink';
import { ONE, ZERO } from 'constants/misc';

export default function PriceUSDDigits({
  price,
  prefix = '$',
  suffix = '',
  className,
  wrapperClassName,
  style,
  size,
  isSink,
  isUSDUnit = false,
}: {
  price?: BigNumber.Value;
  prefix?: string;
  suffix?: string;
  className?: string;
  wrapperClassName?: string;
  style?: CSSProperties;
  size?: TSize;
  isSink?: boolean;
  isUSDUnit?: boolean;
}) {
  const isMobile = useMobile();
  const usdUnitPrice = useMemo(() => {
    if (!isUSDUnit) return '0';

    if (ZERO.eq(price ?? 0)) return '0';
    if (ONE.div(100).gt(price || 0)) return '<0.01';

    return formatPriceUSD(price);
  }, [isUSDUnit, price]);

  if (isUSDUnit)
    return (
      <span className={clsx('price-digits-inner', size && `price-digits-${size}`, className)}>
        {typeof price !== 'undefined' ? `${prefix}${usdUnitPrice}${suffix}` : '-'}
      </span>
    );

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
