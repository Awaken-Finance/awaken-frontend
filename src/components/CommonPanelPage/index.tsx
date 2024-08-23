import { useMobile } from 'utils/isMobile';
import clsx from 'clsx';
import Font from 'components/Font';
import CommonButton from 'components/CommonButton';
import { IconArrowLeft2 } from 'assets/icons';

import './index.less';
import { useMemo } from 'react';

export interface ICommonPanelPageProps {
  className?: string;
  contentClassName?: string;
  children: React.ReactNode;
  title?: string | (() => JSX.Element);
  extraTitle?: React.ReactNode;
  onCancel?: () => void;
  isCancelHide?: boolean;
}

export const CommonPanelPage = ({
  className,
  children,
  title = '',
  onCancel,
  extraTitle,
  isCancelHide = false,
}: ICommonPanelPageProps) => {
  const isMobile = useMobile();

  const titleDom = useMemo(() => {
    if (typeof title === 'string')
      return (
        <Font size={isMobile ? 16 : 20} lineHeight={24} weight="medium">
          {title}
        </Font>
      );
    return title();
  }, [isMobile, title]);

  return (
    <div className={clsx(['common-panel-page', className])}>
      <div className="common-panel-page-body">
        <div className="common-panel-page-header">
          {!isCancelHide && (
            <CommonButton
              className="common-panel-page-header-back"
              type="text"
              icon={<IconArrowLeft2 />}
              onClick={onCancel}
            />
          )}
          {titleDom}
          {extraTitle}
        </div>
        <div className="common-panel-page-content">{children}</div>
      </div>
    </div>
  );
};
