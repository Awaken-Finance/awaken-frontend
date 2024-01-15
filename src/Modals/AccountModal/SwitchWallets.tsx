import { SwitchWalletType, useMultiWallets } from 'aelf-web-login';
import { Row, Col } from 'antd';
import Font from 'components/Font';
import { IconBack, IconCheckPrimary, IconWalletElf, IconWalletPortkey } from 'assets/icons';
import { useTranslation } from 'react-i18next';

export default function SwitchWallets({
  onClickBack,
  onSwitchWallet,
}: {
  onClickBack: () => void;
  onSwitchWallet: (type: SwitchWalletType) => void;
}) {
  const { t } = useTranslation();
  const { current } = useMultiWallets();
  const wallets = [
    {
      type: 'portkey',
      text: 'Portkey SDK',
      Icon: IconWalletPortkey,
    },
    {
      type: 'discover',
      text: 'Portkey Wallet',
      Icon: IconWalletPortkey,
    },
    {
      type: 'elf',
      text: 'Night Elf Wallet',
      Icon: IconWalletElf,
    },
  ];
  return (
    <Row>
      <Col flex={'auto'}>
        <Row className="switch-wallet-header">
          <Col flex={'32px'}>
            <IconBack className="back-icon" onClick={onClickBack} />
          </Col>
          <Col flex={'auto'} className="title">
            <Font size={16} weight="regular">
              {t('SwitchWallet')}
            </Font>
          </Col>
          <Col flex={'32px'}>&nbsp;</Col>
        </Row>
        {wallets.map((item) => {
          return (
            <Row
              className="wallet-item"
              key={item.type}
              justify="center"
              onClick={() => onSwitchWallet(item.type as SwitchWalletType)}>
              <Col flex={'60px'} className="icon-col">
                <item.Icon />
              </Col>
              <Col flex={'auto'} className="name-col">
                <Font size={16}>{item.text}</Font>
              </Col>
              <Col flex={'80px'} className="state-col">
                {current === item.type && (
                  <>
                    <IconCheckPrimary />
                    <Font size={14} color="primary">
                      Connected
                    </Font>
                  </>
                )}
              </Col>
            </Row>
          );
        })}
      </Col>
    </Row>
  );
}
