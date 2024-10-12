import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import moment from 'moment';
import { useEffect, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { TActivity } from 'utils/activity';
import { getValidAddress } from 'utils/wallet';

export const useActivityAllowCheck = (activity?: TActivity) => {
  const { walletInfo } = useConnectWallet();

  const isAllow = useMemo(() => {
    if (!activity) return true;

    let isWhitelist = false;
    if (activity.whitelist && walletInfo?.address) {
      const whitelist = activity.whitelist.map((item) => getValidAddress(item));
      if (whitelist.includes(walletInfo.address)) {
        isWhitelist = true;
      }
    }

    if (activity.isDev && !isWhitelist) return false;
    const isPublished = moment(activity.publishTime).diff(moment()) <= 0;
    if (isPublished) return true;
    if (isWhitelist) return true;

    return false;
  }, [activity, walletInfo?.address]);

  const history = useHistory();
  useEffect(() => {
    if (isAllow) return;
    history.replace('/');
  }, [history, isAllow]);

  return isAllow;
};
