import { useModal } from 'contexts/useModal';
import { basicModalView } from 'contexts/useModal/actions';
import { useTranslation } from 'react-i18next';
import CommonModal from '../../components/CommonModal';
import TransactionSettings from './TransactionSettings';

import './styles.less';
import { useMobile } from 'utils/isMobile';
import { useMemo } from 'react';

export default function TransactionSettingsModal() {
  const { t } = useTranslation();
  const [{ transactionSettingsModal, transactionSettingsModalPosition }, { dispatch }] = useModal();
  const isMobile = useMobile();

  const wrapProps = useMemo(() => {
    const root = document.getElementById('root');
    if (!root) return;
    return {
      style: {
        display: transactionSettingsModal ? 'block' : 'none',
        position: 'absolute',
        top: 0,
        left: 0,
        width: root.clientWidth,
        height: root.clientHeight,
      },
    };
  }, [transactionSettingsModal]);

  const width = 336;
  const height = 300;

  const modalStyle = useMemo(() => {
    if (!transactionSettingsModalPosition) return;
    return {
      left: (transactionSettingsModalPosition.right || 0) - width + 'px',
      top: (transactionSettingsModalPosition.top || 0) + 'px',
    };
  }, [transactionSettingsModalPosition]);

  return (
    <CommonModal
      getContainer={false}
      closable
      showBackIcon={false}
      centered={transactionSettingsModalPosition?.centered || false}
      width={width}
      height={height}
      visible={transactionSettingsModal}
      title={t('tradingSetting')}
      wrapProps={isMobile ? undefined : wrapProps}
      style={
        isMobile
          ? undefined
          : {
              position: 'absolute',
              ...modalStyle,
            }
      }
      onCancel={() =>
        dispatch(basicModalView.setTransactionSettingsModal.actions(false, transactionSettingsModalPosition))
      }
      className="transactions-settings-modal"
      mask={isMobile}
      maskClosable={true}>
      <TransactionSettings />
    </CommonModal>
  );
}
