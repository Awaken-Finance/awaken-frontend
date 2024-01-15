import clsx from 'clsx';
import { HTMLProps, useMemo } from 'react';
import { useMobile } from 'utils/isMobile';
import './ExternalLink.less';

export function ExternalLink({
  target = '_blank',
  href,
  rel = 'noopener noreferrer',
  children,
  className,
}: Omit<HTMLProps<HTMLAnchorElement>, 'as' | 'ref' | 'onClick'>) {
  // TODO
  const isMobile = useMobile();
  const props = useMemo(() => {
    return isMobile ? {} : { target, rel };
  }, [isMobile, rel, target]);
  return (
    <a href={href} className={clsx('external-link', className)} {...props}>
      {children}
    </a>
  );
}
