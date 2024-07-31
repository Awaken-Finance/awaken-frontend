import React, { useMemo } from 'react';
import clsx from 'clsx';

import Font, { FontProps } from 'components/Font';

import './index.less';

interface FeeRateProps extends FontProps {
  useBg?: boolean;
  usePercent?: boolean;
}

export default function FeeRate({
  useBg = false,
  usePercent = true,
  children,
  className = '',
  size = 12,
  ...props
}: FeeRateProps) {
  const style = useMemo(() => {
    return clsx(useBg ? 'fee-rate-use-bg' : '', className);
  }, [useBg, className]);

  return (
    <Font size={size} color="primary" suffix={children && usePercent ? '%' : ''} className={style} {...props}>
      {children ?? '--'}
    </Font>
  );
}
