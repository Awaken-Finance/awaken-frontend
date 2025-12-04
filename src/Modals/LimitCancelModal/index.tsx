import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import CommonModal from 'components/CommonModal';
import CommonButton from 'components/CommonButton';
import './styles.less';
import { useActiveWeb3React } from 'hooks/web3';
import { sleep } from 'utils';
import { useAElfContract } from 'hooks/useContract';
import { LIMIT_CONTRACT_ADDRESS } from 'constants/index';
import { TLimitRecordItem } from 'types/transactions';
import { cancelLimit } from 'utils/limit';
import { REQ_CODE } from 'constants/misc';

export type TLimitCancelModalProps = {
  onSuccess?: (orderId: number) => void;
};

export type TLimitCancelModalInfo = {
  record: TLimitRecordItem;
};
export interface LimitCancelModalInterface {
  show: (params: TLimitCancelModalInfo) => void;
}

export const LimitCancelModal = forwardRef(({ onSuccess }: TLimitCancelModalProps, ref) => {
  const { t } = useTranslation();

  const [isVisible, setIsVisible] = useState(false);
  const [record, setRecord] = useState<TLimitRecordItem>();

  const show = useCallback<LimitCancelModalInterface['show']>(async ({ record }) => {
    setRecord(record);
    await sleep(100);
    setIsVisible(true);
  }, []);
  useImperativeHandle(ref, () => ({ show }));

  const [isLoading, setIsLoading] = useState(false);
  const isLoadingRef = useRef(false);

  const onCancel = useCallback(() => {
    if (isLoadingRef.current) return;
    setIsVisible(false);
  }, []);

  const { account } = useActiveWeb3React();
  const limitContract = useAElfContract(LIMIT_CONTRACT_ADDRESS);

  const onConfirmClick = useCallback(async () => {
    if (!record || !limitContract) return;
    setIsLoading(true);
    isLoadingRef.current = true;
    try {
      const { orderId } = record;
      const args = {
        orderId,
      };
      console.log('CancelLimitOrder', args);
      const req = await cancelLimit({
        contract: limitContract,
        account,
        t,
        args,
      });

      isLoadingRef.current = false;
      if (req === REQ_CODE.Success) {
        onSuccess?.(orderId);
        onCancel();
        return true;
      } else {
        onCancel();
        return false;
      }
    } catch (error) {
      console.log('LimitCancelModal error', error);
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, [account, limitContract, onCancel, onSuccess, record, t]);

  return (
    <CommonModal
      width="420px"
      height={'240px'}
      showType={'modal'}
      showBackIcon={false}
      closable={true}
      centered={true}
      visible={isVisible}
      title={t('Cancel Limit')}
      className={'limit-cancel-modal'}
      onCancel={onCancel}>
      <div className="limit-cancel-content">
        <Trans i18nKey="limitCancelContent" />
      </div>
      <div className="limit-cancel-footer">
        <CommonButton onClick={onCancel} className="limit-cancel-modal-btn">
          {t('Ignore it')}
        </CommonButton>
        <CommonButton onClick={onConfirmClick} loading={isLoading} className="limit-cancel-modal-btn" type="primary">
          {t('Proceed')}
        </CommonButton>
      </div>
    </CommonModal>
  );
});
