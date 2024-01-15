import { notification, Row, Col } from 'antd';
// import { CheckCircleOutlined } from '@ant-design/icons';
import { ArgsProps } from 'antd/lib/notification';
import Copy from 'components/CommonCopy';
import Font from 'components/Font';
import { getExploreLink, shortenTransactionId } from 'utils';
import { IconNotificationSuccess, IconNotificationError, IconClose } from 'assets/icons';
import { TFunction } from 'react-i18next';
import clsx from 'clsx';

function success(props: ArgsProps) {
  notification.success({
    ...props,
    className: clsx('notification-notice-common', props.className),
    icon: <IconNotificationSuccess />,
    closeIcon: <IconClose />,
  });
}
function successToExplorer(
  props: ArgsProps & {
    txId?: string;
  },
  t: TFunction<'translation'>,
) {
  const explorerHref = getExploreLink(props.txId || '', 'transaction');
  notification.success({
    ...props,
    className: clsx('notification-notice-common', props.className),
    description: (
      <>
        {props.description}
        {!!props.description && (
          <>
            <br />
          </>
        )}
        <Row gutter={[6, 0]}>
          <Col>
            <Font size={14} color="two">
              {`${t('transactionID')}:`}
            </Font>
          </Col>
          <Col>
            <Copy copyValue={props.txId}>
              <a target="_blank" href={explorerHref} rel="noreferrer">
                {shortenTransactionId(props.txId || '')}
              </a>
            </Copy>
          </Col>
        </Row>
      </>
    ),
    icon: <IconNotificationSuccess />,
    closeIcon: <IconClose />,
  });
}

function error(props: ArgsProps) {
  notification.error({
    ...props,
    className: clsx('notification-notice-common', props.className),
    icon: <IconNotificationError />,
    closeIcon: <IconClose />,
  });
}
export default {
  success,
  error,
  successToExplorer,
};
