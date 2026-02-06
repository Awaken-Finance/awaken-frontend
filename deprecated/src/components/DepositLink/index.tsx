import { useTranslation } from 'react-i18next';
import './styles.less';
import clsx from 'clsx';
import { useCallback, useMemo, useRef } from 'react';

import { useIsConnected } from 'hooks/useLogin';
import { DepositModal, DepositModalInterface } from 'Modals/DepositModal';
import { DEPOSIT_RECEIVE_TOKEN_MAP } from 'constants/misc';

export type TDepositLinkProps = {
  className?: string;
  receiveToken?: string;
};
export const DepositLink = ({ className, receiveToken }: TDepositLinkProps) => {
  const { t } = useTranslation();
  const isConnected = useIsConnected();

  const depositModalRef = useRef<DepositModalInterface>();

  const onDepositClick = useCallback(() => {
    if (!receiveToken) return;
    depositModalRef.current?.show(receiveToken);
  }, [receiveToken]);

  const isSupport = useMemo(() => DEPOSIT_RECEIVE_TOKEN_MAP[receiveToken || ''], [receiveToken]);

  if (!isConnected || !isSupport) return <></>;

  return (
    <div className={clsx(['deposit-link', className])}>
      {t('depositJumpDescription')}
      &nbsp;
      <a onClick={onDepositClick}>{t('depositJumpLink')}</a>
      {/* <DepositTipModal ref={depositTipModalRef} /> */}
      <DepositModal ref={depositModalRef} />
    </div>
  );
};
