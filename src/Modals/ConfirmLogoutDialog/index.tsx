import React, { useMemo } from 'react';
import { Modal, Button, Row } from 'antd';
import { ConfirmLogoutDialogProps } from 'aelf-web-login';
import { IconLogoutWarn } from 'assets/icons';
import Font from 'components/Font';
import { isMobileDevices } from 'utils/isMobile';
import './styles.less';
import { useTranslation } from 'react-i18next';

const defaultProps: Partial<ConfirmLogoutDialogProps> = {
  visible: false,
  onOk: () => void 0,
  onCancel: () => void 0,
};

export default function ConfirmLogoutDialog(props: Partial<ConfirmLogoutDialogProps>) {
  const { visible, onOk, onCancel } = {
    ...defaultProps,
    ...props,
  };
  const { t } = useTranslation();

  const isMobileDevice = isMobileDevices();
  const className = useMemo(
    () => (isMobileDevice ? 'confirm-logout-dialog-mobile' : 'confirm-logout-dialog'),
    [isMobileDevice],
  );

  return (
    <Modal footer={null} title={null} visible={visible} className={className} closable={false}>
      <Row>
        <IconLogoutWarn className="notice-icon" />
      </Row>
      <Row>
        <Font size={16} color="one">
          {t('exitWallet')}
        </Font>
      </Row>
      <Row>
        <Font size={14} color="two">
          {t('exitWalletTips')}
        </Font>
      </Row>
      {/* <Row>
        <Font size={14} color="two">
          You can ONLY recover this wallet with your guardians.
        </Font>
      </Row> */}
      <Row className="confirm-btn">
        <Button onClick={onOk} type="primary">
          {t('confirmExit')}
        </Button>
      </Row>
      <Row className="cancel-btn">
        <Button onClick={onCancel}>{t('cancel')}</Button>
      </Row>
    </Modal>
  );
}
