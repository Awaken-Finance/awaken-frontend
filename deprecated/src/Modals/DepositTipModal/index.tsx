import { forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import CommonModal from 'components/CommonModal';
import CommonButton from 'components/CommonButton';
import './styles.less';
import { useHistory } from 'react-router-dom';
import { useIsDepositPath } from 'hooks/route';
import { DEPOSIT_RECEIVE_TOKEN_MAP } from 'constants/misc';

export type TDepositTipModalProps = {};

export interface DepositTipModalInterface {
  show: (token?: string) => void;
}

export const DEPOSIT_TIP_MODAL_CONFIRMED = 'DEPOSIT_TIP_MODAL_CONFIRMED';

export const DepositTipModal = forwardRef((_props: TDepositTipModalProps, ref) => {
  const { t } = useTranslation();

  const [isVisible, setIsVisible] = useState(false);
  const [receiveToken, setReceiveToken] = useState<string>();

  const history = useHistory();
  const goDeposit = useCallback(
    (_token?: string) => {
      _token = _token || receiveToken || '';
      if (DEPOSIT_RECEIVE_TOKEN_MAP[_token]) {
        history.push(`/deposit?receiveToken=${_token}`);
      } else {
        history.push(`/deposit`);
      }
    },
    [history, receiveToken],
  );

  const isDepositPath = useIsDepositPath();
  const show = useCallback<DepositTipModalInterface['show']>(
    async (token) => {
      if (isDepositPath) return;
      // let isConfirmed = false;
      const isConfirmed = true;

      // try {
      //   isConfirmed = JSON.parse(localStorage.getItem(DEPOSIT_TIP_MODAL_CONFIRMED) || '');
      // } catch (error) {
      //   isConfirmed = false;
      // }
      if (isConfirmed) {
        goDeposit(token);
        return;
      }
      setReceiveToken(token);
      setIsVisible(true);
    },
    [goDeposit, isDepositPath],
  );
  useImperativeHandle(ref, () => ({ show }));

  const onCancel = useCallback(() => {
    setIsVisible(false);
    setReceiveToken(undefined);
  }, []);

  const onConfirmClick = useCallback(async () => {
    if (isDepositPath) {
      onCancel();
      return;
    }
    localStorage.setItem(DEPOSIT_TIP_MODAL_CONFIRMED, 'true');
    goDeposit();
    onCancel();
  }, [goDeposit, isDepositPath, onCancel]);

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
