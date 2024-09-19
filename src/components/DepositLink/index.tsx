import { useTranslation } from 'react-i18next';
import './styles.less';
import clsx from 'clsx';
import { useCallback, useRef } from 'react';
import { DepositTipModal, DepositTipModalInterface } from 'Modals/DepositTipModal';

export type TDepositLinkProps = {
  className?: string;
  receiveToken?: string;
};
export const DepositLink = ({ className, receiveToken }: TDepositLinkProps) => {
  const { t } = useTranslation();

  const depositTipModalRef = useRef<DepositTipModalInterface>();
  const onDepositClick = useCallback(() => {
    depositTipModalRef.current?.show(receiveToken);
  }, [receiveToken]);

  return (
    <div className={clsx(['deposit-link', className])}>
      {t('depositJumpDescription')}
      &nbsp;
      <a onClick={onDepositClick}>{t('depositJumpLink')}</a>
      <DepositTipModal ref={depositTipModalRef} />
    </div>
  );
};
