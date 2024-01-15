import { useMemo } from 'react';
import { Button, ButtonProps } from 'antd';
import clsx from 'clsx';

import './index.less';

type BtnSize = 'large' | 'middle' | 'small';

export interface CommonButtonProps extends ButtonProps {
  size?: BtnSize;
  className?: string;
}

export default function CommonButton({ children, size = 'middle', className, ...props }: CommonButtonProps) {
  const classNames = useMemo(() => {
    return clsx(
      'common-button',
      {
        'common-button-lg': size === 'large',
        'common-button-sm': size === 'small',
      },
      className,
    );
  }, [size, className]);
  return (
    <Button {...props} className={classNames}>
      {children}
    </Button>
  );
}
