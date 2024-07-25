import { Menu } from 'antd';
import { CHAIN_NAME, networkList } from '../../constants';
import { useMemo, useState } from 'react';
import { switchNetwork } from '../../utils/network';
import { SupportedELFChainId } from 'constants/chain';
import { useActiveWeb3React } from 'hooks/web3';
import CommonDropdown from 'components/CommonDropdown';
import CommonButton from 'components/CommonButton';
import { IconArrowDown, IconLogoutWarn } from 'assets/icons';
import { elfChain } from 'assets/images';
import { useMobile } from 'utils/isMobile';
import CommonModal from 'components/CommonModal';
import Font from 'components/Font';
import { useTranslation } from 'react-i18next';

import './index.less';
import { useConnectWallet } from '@aelf-web-login/wallet-adapter-react';

export default function Network(props: { overlayClassName?: string | undefined }) {
  const { chainId } = useActiveWeb3React();
  const { disConnectWallet } = useConnectWallet();
  const [modalOpen, setModalOpen] = useState(false);
  const isMobile = useMobile();
  const { t } = useTranslation();
  const menu = useMemo(() => {
    return (
      <Menu className="network-menus" selectedKeys={chainId ? [chainId.toString()] : undefined}>
        {networkList.map((i) => {
          return (
            <Menu.Item key={i.info.chainId} onClick={() => switchNetwork(i.info)}>
              <img src={elfChain} width={24} height={24} />
              <span className="flex-1">{i.title}</span>
              <div className="dot"></div>
            </Menu.Item>
          );
        })}
      </Menu>
    );
  }, [chainId]);

  const renderDisconnectModal = () => {
    return (
      <CommonModal key={'disconnect-wallet-modal'} title={null} visible={modalOpen} className="disconnect-wallet-modal">
        <IconLogoutWarn />
        <Font size={16} weight="medium">
          {t('networkTips')}
        </Font>
        <CommonButton type="primary" className="disconnect-btn" onClick={onClickDisconnect}>
          {t('disconnectWallet')}
        </CommonButton>
      </CommonModal>
    );
  };

  const onClickDisconnect = () => {
    disConnectWallet();
    setModalOpen(false);
  };

  if (!chainId) return null;

  return (
    <>
      <CommonDropdown
        className="network-dropdown-btn"
        overlayClassName={props.overlayClassName}
        overlay={menu}
        placement="bottomRight"
        trigger={['click']}>
        <CommonButton type="default" icon={<img width={20} height={20} src={elfChain} />}>
          {CHAIN_NAME[chainId as SupportedELFChainId] || 'Wrong Network'}&nbsp;
          {!isMobile && <IconArrowDown />}
        </CommonButton>
      </CommonDropdown>
      {renderDisconnectModal()}
    </>
  );
}
