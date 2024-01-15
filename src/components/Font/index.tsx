import React, { useMemo } from 'react';
import clsx from 'clsx';

import getFontStyle, { FontStyleProps } from 'utils/getFontStyle';

import './index.less';

export interface FontProps extends FontStyleProps {
  className?: string;
  children?: React.ReactChild | React.ReactNode;
  prefix?: string | SVGAElement | JSX.Element;
  subfix?: string | SVGAElement | JSX.Element;
}

export default function Font({
  weight = 'regular',
  color = 'one',
  size = 14,
  lineHeight,
  align,
  className = '',
  children,
  prefix = '',
  subfix = '',
}: FontProps): JSX.Element {
  const style = useMemo(() => {
    return clsx('default-font-style', getFontStyle(weight, color, size, lineHeight, align), className);
  }, [className, weight, color, size, lineHeight, align]);

  return <span className={style}>{`${prefix}${children}${subfix}`}</span>;
}
