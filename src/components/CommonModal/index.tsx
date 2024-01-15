import { useMemo } from 'react';
import { Modal, ModalProps, Drawer, DrawerProps } from 'antd';
import clsx from 'clsx';
import { useMobile } from 'utils/isMobile';
import Font from 'components/Font';
import { IconArrowLeft2, IconClose } from 'assets/icons';
import CommonButton from 'components/CommonButton';

import './index.less';

interface CommonModalProps extends ModalProps, DrawerProps {
  leftCallBack?: () => void;
  transitionName?: string;
  showBackIcon?: boolean;
  showType?: 'modal' | 'drawer' | '';
  closeOnLogin?: boolean;
  getContainer?: string | HTMLElement | (() => HTMLElement) | false;
}

export default function CommonModal({
  leftCallBack,
  width = '480px',
  height = '710px',
  title = 'title',
  centered,
  className,
  onCancel,
  placement = 'bottom',
  visible = false,
  showBackIcon = true,
  closable = false,
  showType = '',
  getContainer,
  ...props
}: CommonModalProps) {
  const isMobile = useMobile();

  const renderTitle = useMemo(() => {
    if (!title) return null;

    let titleDom: string | null | React.ReactNode = title;

    if (typeof title === 'string') {
      titleDom = (
        <Font size={16} weight="medium">
          {title}
        </Font>
      );
    }

    return (
      <>
        {showBackIcon && (
          <CommonButton
            className="back-icon-btn"
            type="text"
            icon={<IconArrowLeft2 />}
            onClick={leftCallBack || onCancel}
          />
        )}
        {titleDom}
        {closable && (
          <CommonButton
            className="close-icon-btn"
            type="text"
            icon={<IconClose />}
            onClick={(e) => onCancel?.(e as any)}
          />
        )}
      </>
    );
  }, [title, onCancel, showBackIcon, closable, leftCallBack]);

  const renderContent = () => {
    if (showType === 'modal') {
      return (
        <Modal
          maskClosable={false}
          centered={centered}
          destroyOnClose
          footer={null}
          width={width}
          className={clsx('common-modal', className)}
          title={renderTitle}
          closable={false}
          visible={visible}
          onCancel={onCancel}
          {...props}
        />
      );
    }

    if (showType === 'drawer' || isMobile) {
      const drawProps = {
        ...props,
      };
      delete drawProps.wrapProps;
      return (
        <Drawer
          maskClosable={false}
          closable={false}
          title={renderTitle}
          placement={placement}
          className={clsx('common-modal', className)}
          height={height}
          width={width}
          visible={visible}
          onClose={onCancel as any}
          {...drawProps}
        />
      );
    }

    return (
      <Modal
        getContainer={getContainer}
        maskClosable={false}
        centered={centered}
        destroyOnClose
        footer={null}
        width={width}
        className={clsx('common-modal', className)}
        title={renderTitle}
        closable={false}
        visible={visible}
        onCancel={onCancel}
        {...props}
      />
    );
  };

  return renderContent();
}
