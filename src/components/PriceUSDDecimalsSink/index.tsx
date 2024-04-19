import BigNumber from 'bignumber.js';
import { formatPriceUSDSplit } from 'utils/price';
import { useMemo } from 'react';
import DecimalsSink, { IBaseDecimalsSinkProps } from 'components/DecimalsSink';

export interface IPriceUSDDecimalsSinkProps extends IBaseDecimalsSinkProps {
  price?: BigNumber.Value;
}

export default function PriceUSDDecimalsSink({ price, prefix = '$', ...props }: IPriceUSDDecimalsSinkProps) {
  const priceInfo = useMemo(() => (typeof price !== 'undefined' ? formatPriceUSDSplit(price) : undefined), [price]);
  return <DecimalsSink {...props} {...priceInfo} prefix={prefix} />;
}
