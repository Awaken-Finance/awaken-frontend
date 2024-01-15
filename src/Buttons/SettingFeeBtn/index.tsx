import clsx from 'clsx';
import { TconSetFee } from 'assets/icons';
import CommonButton, { CommonButtonProps } from 'components/CommonButton';
import { basicModalView } from 'contexts/useModal/actions';
import { useModalDispatch } from 'contexts/useModal/hooks';

import './index.less';

export default function SettingFee({ className, children }: CommonButtonProps) {
  const modalDispatch = useModalDispatch();

  const onClick = () => {
    const btn = document.querySelector('.setting-fee-btn');
    if (!btn) return;
    modalDispatch(
      basicModalView.setTransactionSettingsModal.actions(true, {
        right: btn.getBoundingClientRect().right + window.scrollX,
        top: btn.getBoundingClientRect().bottom + window.scrollY,
      }),
    );
  };

  if (children) {
    return (
      <CommonButton onClick={onClick} className={clsx('setting-fee-btn', className)}>
        {children}
      </CommonButton>
    );
  }

  return (
    <CommonButton type="text" icon={<TconSetFee />} onClick={onClick} className={clsx('setting-fee-btn', className)} />
  );
}
