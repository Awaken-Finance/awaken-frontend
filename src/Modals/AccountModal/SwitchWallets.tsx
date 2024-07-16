import { Row, Col } from 'antd';
import Font from 'components/Font';
import { IconBack, IconCheckPrimary, IconWalletElf, IconWalletPortkey, IconWalletSDK } from 'assets/icons';
import { useTranslation } from 'react-i18next';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';
import { WalletTypeEnum } from '@aelf-web-login/wallet-adapter-base';

export default function SwitchWallets({
  onClickBack,
  onSwitchWallet,
}: {
  onClickBack: () => void;
  onSwitchWallet: (type: any) => void;
}) {
  const { t } = useTranslation();

  const wallets = [
    {
      type: WalletTypeEnum.aa,
      text: 'Portkey SDK',
      Icon: IconWalletSDK,
    },
    {
      type: WalletTypeEnum.discover,
      text: 'Portkey Wallet',
      Icon: IconWalletPortkey,
    },
    {
      type: WalletTypeEnum.elf,
      text: 'Night Elf Wallet',
      Icon: IconWalletElf,
    },
  ];

  // TODO: v2
  // const { current } = useMultiWallets();
  const { walletType } = useConnectWallet();

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
              onClick={() => onSwitchWallet(item.type as any)}>
              <Col flex={'60px'} className="icon-col">
                <item.Icon />
              </Col>
              <Col flex={'auto'} className="name-col">
                <Font size={16}>{item.text}</Font>
              </Col>
              <Col flex={'80px'} className="state-col">
                {walletType === item.type && (
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
