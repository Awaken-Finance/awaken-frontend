import { useModal } from 'contexts/useModal';
import { basicModalView } from 'contexts/useModal/actions';
import CommonModal from '../../components/CommonModal';
import { useTranslation } from 'react-i18next';

import './styles.less';
import Font from 'components/Font';
import CommonButton from 'components/CommonButton';
import { Col, Row } from 'antd';
import { formatSymbol } from 'utils/token';
import { useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { useMobile } from 'utils/isMobile';

export default function SwapNotSupportedModal() {
  const { t } = useTranslation();
  const [{ swapNotSupportedModal }, { dispatch }] = useModal();
  const history = useHistory();
  const isMobile = useMobile();

  const onCancel = useCallback(() => {
    dispatch(basicModalView.setSwapNotSupported.actions(undefined));
  }, [dispatch]);

  const toCreate = useCallback(() => {
    onCancel();
    history.push(`/create-pair/${swapNotSupportedModal?.tokenIn.symbol}_${swapNotSupportedModal?.tokenOut.symbol}`);
  }, [history, onCancel, swapNotSupportedModal?.tokenIn.symbol, swapNotSupportedModal?.tokenOut.symbol]);

  return (
    <CommonModal
      width="420px"
      height="244px"
      showType="modal"
      showBackIcon={false}
      closable={true}
      centered={isMobile}
      visible={!!swapNotSupportedModal}
      title={t('Swap is not supported')}
      className={'swap-not-supported-modal'}
      onCancel={onCancel}>
      <div className="swap-not-supported-modal-content">
        <Font size={14} lineHeight={20}>
          {t('SwapNotSupportedContent', {
            symbolIn: formatSymbol(swapNotSupportedModal?.tokenIn.symbol),
            symbolOut: formatSymbol(swapNotSupportedModal?.tokenOut.symbol),
          })}
        </Font>
      </div>
      <Row gutter={[12, 0]}>
        <Col flex={'1 1 0'}>
          <CommonButton onClick={onCancel} className="swap-not-supported-modal-btn">
            {t('cancel')}
          </CommonButton>
        </Col>
        <Col flex={'1 1 0'}>
          <CommonButton onClick={toCreate} className="swap-not-supported-modal-btn" type="primary">
            {t('Go To Create')}
          </CommonButton>
        </Col>
      </Row>
    </CommonModal>
  );
}
