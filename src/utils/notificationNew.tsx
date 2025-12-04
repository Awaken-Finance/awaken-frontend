import { notification } from 'antd';
import { ArgsProps } from 'antd/lib/notification';
import {
  IconNotificationSuccess,
  IconNotificationError,
  IconClose,
  IconNotificationWarning,
  IconNotificationInfo,
} from 'assets/icons';
import clsx from 'clsx';

function success(props: ArgsProps) {
  notification.success({
    ...props,
    icon: <IconNotificationSuccess />,
    closeIcon: <IconClose />,
    className: clsx('notification-notice-common', props.className),
  });
}
function warning(props: ArgsProps) {
  notification.warning({
    ...props,
    icon: <IconNotificationWarning />,
    closeIcon: <IconClose />,
    className: clsx('notification-notice-common', props.className),
  });
}
function info(props: ArgsProps) {
  notification.info({
    ...props,
    icon: <IconNotificationInfo />,
    closeIcon: <IconClose />,
    className: clsx('notification-notice-common', props.className),
  });
}
function open(props: ArgsProps) {
  notification.open({
    ...props,
    closeIcon: <IconClose />,
    className: clsx('notification-notice-open, notification-notice-common', props.className),
  });
}

function error(props: ArgsProps) {
  notification.error({
    ...props,
    icon: <IconNotificationError />,
    closeIcon: <IconClose />,
    className: clsx('notification-notice-common', props.className),
  });
}
export default {
  success,
  warning,
  error,
  info,
  open,
};
