import React, { useMemo } from 'react';
import clsx from 'clsx';

import Font, { FontProps } from 'components/Font';

import './index.less';

interface FeeRateProps extends FontProps {
  useBg?: boolean;
}

export default function FeeRate({ useBg = false, children, className = '', size = 12, ...props }: FeeRateProps) {
  const style = useMemo(() => {
    return clsx(useBg ? 'fee-rate-use-bg' : '', className);
  }, [useBg, className]);

  return (
    <Font size={size} color="primary" subfix="%" className={style} {...props}>
      {children}
    </Font>
  );
}
