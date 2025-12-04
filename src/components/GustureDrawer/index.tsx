import { useState, useMemo, useCallback } from 'react';
import clsx from 'clsx';
import { useDrag } from '@use-gesture/react';
import { a, useSpring, config } from '@react-spring/web';

import { IconClose, IconBack } from 'assets/icons';

import './index.less';

export type Placement = 'left' | 'right' | 'top' | 'bottom';

export interface GustureDrawerProps {
  height?: string | number;
  width?: string | number;

  open?: boolean;

  mask?: boolean;
  maskClosable?: boolean;

  closable?: boolean;
  closeIcon?: React.ReactNode;

  backable?: boolean;
  backIcon?: React.ReactNode;

  placement?: Placement;
  title?: React.ReactNode;

  children?: React.ReactNode;
  footer?: React.ReactNode;

  onClose?: () => void;
  onBack?: () => void;

  className?: string;
  maskStyle?: React.CSSProperties;
  drawerStyle?: React.CSSProperties;
  headerStyle?: React.CSSProperties;
  bodyStyle?: React.CSSProperties;
  footerStyle?: React.CSSProperties;
}

export default function GustureDrawer({
  height = '100vh',
  width = '100vw',
  open = false,

  mask = true,
  maskClosable = true,

  backable = true,
  backIcon = null,

  closable = true,
  closeIcon = null,

  placement = 'bottom',
  title = null,

  children,
  footer = null,

  onClose = () => null,
  onBack = () => null,

  maskStyle = {},
  drawerStyle = {},
  headerStyle = {},
  bodyStyle = {},
  footerStyle = {},
}: GustureDrawerProps) {
  const [visible, setVisible] = useState(open);

  const close = useCallback(() => setVisible(false), []);

  const handleClose = useCallback(() => {
    onClose();
    close();
  }, [close, onClose]);

  const handleBack = useCallback(() => {
    onBack();
    close();
  }, [close, onBack]);

  const openDrawer = useCallback(() => {
    setVisible(true);
  }, []);

  const handleClickMask = useCallback(() => maskClosable && close(), [maskClosable, close]);

  const contentStyle = useMemo(() => {
    let style: React.CSSProperties = {};

    switch (placement) {
      case 'top':
        style = {
          width: '100%',
          height: height,
          left: 0,
          top: 0,
        };
        break;
      case 'bottom':
        style = {
          width: '100%',
          height: height,
          left: 0,
          bottom: 0,
        };
        break;
      case 'right':
        style = {
          width: width,
          height: '100%',
          top: 0,
          right: 0,
        };
        break;
      case 'left':
        style = {
          width: width,
          height: '100%',
          top: 0,
          left: 0,
        };
        break;
    }

    return style;
  }, [height, placement, width]);

  const renderMask = useMemo(
    () => mask && <a.div className="guster-drawer-mask" style={maskStyle} onClick={handleClickMask} />,
    [handleClickMask, mask, maskStyle],
  );

  const renderBackIcon = useMemo(() => {
    if (!backable) {
      return null;
    }
    return (
      <div className="guster-drawer-icon-back" onClick={handleBack}>
        {backIcon || <IconBack />}
      </div>
    );
  }, [backIcon, backable, handleBack]);

  const renderColseIcon = useMemo(() => {
    if (!closable) {
      return null;
    }

    return (
      <div className="guster-drawer-icon-close" onClick={handleClose}>
        {closeIcon || <IconClose />}
      </div>
    );
  }, [closable, closeIcon, handleClose]);

  const renderTitel = useMemo(() => title && <div className="guster-drawer-title"></div>, [title]);

  const renderFooter = useMemo(
    () =>
      footer && (
        <div className="guster-drawer-wrappe-footer" style={footerStyle}>
          {footer}
        </div>
      ),
    [footer, footerStyle],
  );

  return (
    <div className="guster-drawer" style={drawerStyle}>
      {renderMask}
      <a.div className="guster-drawer-content" style={contentStyle} aria-modal="true" role="dialog">
        <div className="guster-drawer-wrappe-body">
          {renderBackIcon}
          {renderColseIcon}
          <div className="guster-drawer-header" style={headerStyle}>
            {renderTitel}
          </div>
          <div className="guster-drawer-body" style={bodyStyle}>
            {children}
          </div>
          {renderFooter}
        </div>
      </a.div>
    </div>
  );
}
