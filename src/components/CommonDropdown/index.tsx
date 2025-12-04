import { Dropdown, DropdownProps } from 'antd';
import './index.less';

export default function CommonDropdown({ className, overlayClassName, children, ...props }: DropdownProps) {
  const classNames = className ? `common-dropdown ${className}` : 'common-dropdown';
  const overlayClassNames = overlayClassName ? `common-dropdown-menu ${overlayClassName}` : 'common-dropdown-menu';
  return (
    <Dropdown className={classNames} overlayClassName={overlayClassNames} {...props}>
      {children}
    </Dropdown>
  );
}
