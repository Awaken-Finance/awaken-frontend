import Icon from '@ant-design/icons';
import { Button } from 'antd';
import React, { useMemo } from 'react';
import { isUrl } from '../../utils/reg';
import { ReactComponent as LinkIcon } from 'assets/images/link.svg';
import clsx from 'clsx';
import './styles.less';
import { useMobile } from 'utils/isMobile';
const tagAStyle = { padding: 0, height: 'auto', lineHeight: '18px' };
export default function CommonLink({
  href,
  children,
  className,
  hideIcon,
  isTagA,
}: {
  href: string;
  children?: React.ReactNode;
  className?: string;
  hideIcon?: boolean;
  isTagA?: boolean;
}) {
  const isMobile = useMobile();
  const props = useMemo(() => (isMobile ? {} : { target: '_blank' }), [isMobile]);
  return (
    <Button
      className={clsx('common-link', className)}
      disabled={!href || !isUrl(href)}
      onClick={(e) => e.stopPropagation()}
      {...props}
      type="link"
      href={href}
      style={isTagA ? tagAStyle : {}}>
      {!hideIcon && <Icon component={LinkIcon} />}
      {children}
    </Button>
  );
}
