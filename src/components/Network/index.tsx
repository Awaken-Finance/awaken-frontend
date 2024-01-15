import { Menu } from 'antd';
import detectProvider from '@portkey/detect-provider';
import { CHAIN_NAME, networkList } from '../../constants';
import { useMemo, useState } from 'react';
import { switchNetwork } from '../../utils/network';
import { SupportedELFChainId } from 'constants/chain';
import { useActiveWeb3React } from 'hooks/web3';
import CommonDropdown from 'components/CommonDropdown';
import CommonButton from 'components/CommonButton';
import { IconArrowDown, IconLogoutWarn, IconRedError } from 'assets/icons';
import { elfChain } from 'assets/images';
import { WalletType, WebLoginEvents, getConfig, useWebLogin, useWebLoginEvent } from 'aelf-web-login';
import { useInterval } from 'react-use';
import { useMobile } from 'utils/isMobile';
import CommonTooltip from 'components/CommonTooltip';
import CommonModal from 'components/CommonModal';
import Font from 'components/Font';
import { useTranslation } from 'react-i18next';

import './index.less';

function useNetworkCheck() {
  const { walletType, wallet } = useWebLogin();
  const [mismatch, setMismatch] = useState(false);

  const checkNetwork = async () => {
    try {
      const provider = await detectProvider();
      if (!provider) return;
      const network = await provider.request({
        method: 'network',
      });
      console.log(network);
      setMismatch(network !== getConfig().networkType);
    } catch (error) {
      console.warn(error);
      setMismatch(false);
    }
  };

  useWebLoginEvent(WebLoginEvents.NETWORK_MISMATCH, () => {
    setMismatch(true);
  });

  useInterval(() => {
    if (mismatch) {
      checkNetwork();
    }
  }, 500);

  if (walletType !== WalletType.discover) return false;

  if (!wallet.discoverInfo?.provider) {
    return false;
  }

  return mismatch;
}

export default function Network(props: { overlayClassName?: string | undefined }) {
  const { chainId } = useActiveWeb3React();
  const { logout } = useWebLogin();
  const [modalOpen, setModalOpen] = useState(false);
  const networkMismatch = useNetworkCheck();
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
    logout();
    setModalOpen(false);
  };

  useWebLoginEvent(WebLoginEvents.NETWORK_MISMATCH, () => {
    setModalOpen(true);
  });

  if (!chainId) return null;

  if (networkMismatch) {
    return (
      <>
        <CommonTooltip
          type="error"
          title="Your wallet’s current network is unsupported."
          overlayClassName="network-tooltip"
          placement={isMobile ? 'bottom' : 'left'}>
          <IconRedError />
        </CommonTooltip>
        {renderDisconnectModal()}
      </>
    );
  }

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
