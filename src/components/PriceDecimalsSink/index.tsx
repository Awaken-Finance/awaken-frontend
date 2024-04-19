import BigNumber from 'bignumber.js';
import { formatPriceSplit } from 'utils/price';

import DecimalsSink, { IBaseDecimalsSinkProps } from 'components/DecimalsSink';
import { useMemo } from 'react';

export interface IPriceDecimalsSinkProps extends IBaseDecimalsSinkProps {
  price: BigNumber.Value;
}

export default function PriceDecimalsSink({ price, ...props }: IPriceDecimalsSinkProps) {
  const priceInfo = useMemo(() => formatPriceSplit(price), [price]);
  return <DecimalsSink {...props} {...priceInfo} />;
}
