import { forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import CommonModal from 'components/CommonModal';
import CommonButton from 'components/CommonButton';
import './styles.less';
import { useHistory, useLocation } from 'react-router-dom';

export type TDepositTipModalProps = {};

export interface DepositTipModalInterface {
  show: () => void;
}

export const DepositTipModal = forwardRef((_props: TDepositTipModalProps, ref) => {
  const { t } = useTranslation();

  const [isVisible, setIsVisible] = useState(false);

  const show = useCallback<DepositTipModalInterface['show']>(async () => {
    setIsVisible(true);
  }, []);
  useImperativeHandle(ref, () => ({ show }));

  const onCancel = useCallback(() => {
    setIsVisible(false);
  }, []);

  const history = useHistory();
  const { pathname } = useLocation();
  const onConfirmClick = useCallback(async () => {
    if (pathname === '/deposit' || pathname === '/withdraw') {
      onCancel();
      return;
    }
    history.push(`/deposit`);
    onCancel();
  }, [history, onCancel, pathname]);

  return (
    <CommonModal
      width="420px"
      height={'240px'}
      showType={'modal'}
      showBackIcon={false}
      closable={true}
      centered={true}
      visible={isVisible}
      title={t('depositTipTitle')}
      className={'deposit-tip-modal'}
      onCancel={onCancel}>
      <div className="deposit-tip-content">
        <Trans i18nKey="depositTipContent" />
      </div>
      <div className="deposit-tip-footer">
        <CommonButton onClick={onCancel} className="deposit-tip-modal-btn">
          {t('cancel')}
        </CommonButton>
        <CommonButton onClick={onConfirmClick} className="deposit-tip-modal-btn" type="primary">
          {t('Confirm')}
        </CommonButton>
      </div>
    </CommonModal>
  );
});
