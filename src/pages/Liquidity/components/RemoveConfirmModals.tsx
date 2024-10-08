import { Col, Row } from 'antd';
import CommonButton from 'components/CommonButton';
import CommonModal from 'components/CommonModal';
import Font from 'components/Font';
import CurrencyRow from './CurrencyRow';
import { Currency } from '@awaken/sdk-core';
import { useTranslation } from 'react-i18next';
import { useMobile } from 'utils/isMobile';
import BigNumber from 'bignumber.js';
import { divDecimals } from 'utils/calculate';
import { useUserSettings } from 'contexts/useUserSettings';
import { parseUserSlippageTolerance } from 'utils/swap';
import { useTransactionFee } from 'contexts/useStore/hooks';

export function RemoveConfirmModal({
  tokenA,
  tokenB,
  tokenAValue,
  tokenBValue,
  visible,
  onClose,
  onConfirm,
}: {
  tokenA: Currency | undefined;
  tokenB: Currency | undefined;
  tokenAValue: string | undefined;
  tokenBValue: string | undefined;
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const { t } = useTranslation();
  const isMobile = useMobile();
  const width = isMobile ? '320px' : '420px';

  const transactionFee = useTransactionFee();

  const [{ userSlippageTolerance }] = useUserSettings();

  if (!tokenA || !tokenB || !tokenAValue || !tokenBValue) return null;
  return (
    <CommonModal
      className={isMobile ? 'liq-confirm-modal-m' : 'remove-liq-confirm-modal'}
      visible={visible}
      width={width}
      showType="modal"
      title={t('YouWillReceive')}
      onClose={onClose}
      onCancel={onClose}
      showBackIcon={false}
      closable={true}
      centered>
      <Row>
        <Col className="sub-row-container" flex={1}>
          <CurrencyRow token={tokenA} value={tokenAValue} isSuffixShow={false} />
          <CurrencyRow token={tokenB} value={tokenBValue} isSuffixShow={false} />
        </Col>
      </Row>
      <Row>
        <Font size={14} color="one" lineHeight={20}>
          {t('YouWillReceiveDesc', { value: parseUserSlippageTolerance(userSlippageTolerance) })}
        </Font>
      </Row>
      <Row gutter={[2, 0]} align="middle">
        <Col flex={1}>
          <Font size={14} color="two">
            {t('EstimatedTransactionFee')}
          </Font>
        </Col>
        <Col>
          <Font lineHeight={20} weight="medium">
            {divDecimals(new BigNumber(transactionFee), 8).toFixed()}
          </Font>
          <Font lineHeight={20} weight="medium" color="two">
            &nbsp;ELF
          </Font>
        </Col>
      </Row>
      <CommonButton type="primary" size="large" block onClick={onConfirm}>
        <Font size={16} color={'one'}>
          {t('ConfirmRemove')}
        </Font>
      </CommonButton>
    </CommonModal>
  );
}
