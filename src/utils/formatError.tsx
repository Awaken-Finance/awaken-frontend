import { message, notification } from 'antd';
import i18n from 'i18n';

const approveCancelMsg = [
  'Operation canceled',
  'You closed the prompt without any action',
  'User denied',
  'User close the prompt',
  'User Cancel',
];

function getErrorMsg(error: any): string {
  return error instanceof Error ? error.toString() : JSON.stringify(error);
}

export function formatApproveError(error: any) {
  const errorMsg = getErrorMsg(error);
  let errorStr = 'ApproveFail';
  if (approveCancelMsg.some((msg) => new RegExp(msg).test(errorMsg))) {
    errorStr = 'User Cancel';
  }
  message.error(i18n.t(errorStr));
}

export function formatSwapError(
  error: any,
  data: {
    amount?: string;
    symbol?: string;
  },
) {
  const errorMsg = getErrorMsg(error);
  if (/Insufficient allowance. Token/.test(errorMsg)) {
    notification.error({
      message: i18n.t('swapFailed'),
      description: i18n.t('ensuring that you approve an adequate amount', data),
    });
    return;
  }

  notification.error({
    message: i18n.t('swapFailed'),
    description: error.message,
  });
}
