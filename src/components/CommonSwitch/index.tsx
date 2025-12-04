import clsx from 'clsx';
import { Switch, SwitchProps } from 'antd';
import './index.less';

export default function CommonSwitch({ className = '', ...props }: SwitchProps) {
  return <Switch className={clsx('common-switch', className)} {...props} />;
}
