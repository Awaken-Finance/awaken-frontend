import { Tabs, TabsProps } from 'antd';
import clsx from 'clsx';
import './styles.less';
export default function CardTabs(props: TabsProps) {
  return (
    <Tabs
      {...props}
      className={clsx('card-tabs', props.className)}
      animated={props.animated || { inkBar: true, tabPane: true }}
    />
  );
}
