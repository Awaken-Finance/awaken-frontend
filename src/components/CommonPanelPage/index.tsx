import { useMobile } from 'utils/isMobile';
import clsx from 'clsx';
import Font from 'components/Font';
import CommonButton from 'components/CommonButton';
import { IconArrowLeft2 } from 'assets/icons';

import './index.less';

export interface ICommonPanelPageProps {
  className?: string;
  contentClassName?: string;
  children: React.ReactNode;
  title?: string;
  extraTitle?: React.ReactNode;
  onCancel?: () => void;
}

export const CommonPanelPage = ({ className, children, title = '', onCancel, extraTitle }: ICommonPanelPageProps) => {
  const isMobile = useMobile();

  return (
    <div className={clsx(['common-panel-page', className])}>
      <div className="common-panel-page-body">
        <div className="common-panel-page-header">
          <CommonButton
            className="common-panel-page-header-back"
            type="text"
            icon={<IconArrowLeft2 />}
            onClick={onCancel}
          />
          <Font size={isMobile ? 16 : 20} lineHeight={24} weight="medium">
            {title}
          </Font>
          {extraTitle}
        </div>
        <div className="common-panel-page-content">{children}</div>
      </div>
    </div>
  );
};
