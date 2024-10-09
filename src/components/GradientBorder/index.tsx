import { ReactNode } from 'react';
import './styles.less';
import clsx from 'clsx';

export type TGradientBorderProps = {
  containerClassName?: string;
  children?: ReactNode;
  className?: string;
  borderColor?: string;
  backgroundColor?: string;
  borderRadius?: string;
};

export const GradientBorder = ({
  containerClassName,
  children,
  className,
  borderColor,
  backgroundColor,
  borderRadius = '8px',
}: TGradientBorderProps) => {
  return (
    <div
      className={clsx(['gradient-border-wrap', containerClassName])}
      style={{ background: borderColor, borderRadius }}>
      <div className={clsx(['gradient-border-inner', className])} style={{ background: backgroundColor, borderRadius }}>
        {children}
      </div>
    </div>
  );
};