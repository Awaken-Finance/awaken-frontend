import { ReactNode, useCallback, useMemo } from 'react';
import { Tooltip, TooltipProps } from 'antd';
import clsx from 'clsx';
import { useMobile } from 'utils/isMobile';
import { useModalDispatch } from 'contexts/useModal/hooks';
import { basicModalView } from 'contexts/useModal/actions';

import './styles.less';

export default function CommonTooltip({
  children,
  className,
  type,
  onClick,
  headerDesc,
  useTooltip = false,
  visible = false,
  title,
  buttonTitle,
  arrowPointAtCenter = true,
  align,
  placement = 'topLeft',
  ...props
}: TooltipProps & {
  onClick?: () => void;
  buttonTitle?: string;
  type?: 'light' | 'dark' | 'error';
  useTooltip?: boolean;
  headerDesc?: ReactNode;
  visible?: boolean;
}) {
  const modalDispatch = useModalDispatch();
  const isMobile = useMobile();

  const renderChildren = useMemo(() => {
    if (!children) {
      return <span className={clsx('common-question', !isMobile && 'common-question-pc')}></span>;
    }
    return children;
  }, [children, isMobile]);

  const style = useMemo(() => {
    return clsx(
      'common-tooltip',
      {
        'common-tooltip-error': type === 'error',
      },
      className,
    );
  }, [className, type]);

  const handleClick = useCallback(() => {
    if (!isMobile || useTooltip) {
      return;
    }

    if (typeof onClick === 'function') {
      return onClick();
    }

    modalDispatch(
      basicModalView.setTooltipModal.actions({
        title,
        headerDesc,
        buttonTitle,
      }),
    );
  }, [isMobile, useTooltip, onClick, modalDispatch, title, headerDesc, buttonTitle]);

  const renderAlign = useMemo(() => {
    if (align) {
      return align;
    }

    switch (placement) {
      case 'bottomLeft':
        return {
          offset: [-22, 0],
        };
      case 'topLeft':
        return {
          offset: [-25, 0],
        };
      case 'topRight':
        return {
          offset: [22, 0],
        };
      case 'bottomRight':
        return {
          offset: [25, 0],
        };
    }

    return undefined;
  }, [align, placement]);

  const open = useMemo(() => {
    if (useTooltip) {
      return visible;
    }

    if (isMobile) {
      return false;
    }

    return undefined;
  }, [visible, isMobile, useTooltip]);

  return (
    <Tooltip
      getPopupContainer={(triggerNode: HTMLElement) => triggerNode}
      placement={placement}
      overlayClassName={style}
      visible={open}
      title={title}
      className="awk-common-tool-tip"
      arrowPointAtCenter={arrowPointAtCenter}
      autoAdjustOverflow={false}
      align={renderAlign}
      {...props}>
      <span onClick={handleClick}>{renderChildren}</span>
    </Tooltip>
  );
}
