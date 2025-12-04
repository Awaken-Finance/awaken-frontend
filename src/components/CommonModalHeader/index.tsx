import { IconArrowLeft2, IconClose } from 'assets/icons';
import CommonButton from 'components/CommonButton';

import './index.less';

export type CommonModalHeaderProps = {
  title: string;
  showClose?: boolean;
  showBack?: boolean;
  onBack?: () => void;
  onClose?: () => void;
};

export default function CommonModalHeader({ title, showClose, showBack, onBack, onClose }: CommonModalHeaderProps) {
  return (
    <div className="ant-modal-header common-modal-header">
      <div className="ant-modal-title">
        {showBack && <CommonButton className="back-icon-btn" type="text" icon={<IconArrowLeft2 />} onClick={onBack} />}
        <span className="default-font-style font-weight-medium font-color-one font-size-16 line-height-undefined text-align-left">
          {title}
        </span>
        {showClose && <CommonButton className="close-icon-btn" type="text" icon={<IconClose />} onClick={onClose} />}
      </div>
    </div>
  );
}
