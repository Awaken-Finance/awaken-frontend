import { useWebLogin } from 'aelf-web-login';
import { Row, Col, Avatar, message } from 'antd';
import { shortenAddress } from 'utils';
import Font from 'components/Font';
import { IconCopy, IconLogout, IconSwitch } from 'assets/icons';
import { userAvatar } from 'assets/images';
import { useMemo } from 'react';
import useChainId from 'hooks/useChainId';
import { useCopyToClipboard } from 'react-use';
import { useMobile } from 'utils/isMobile';

export default function AccountInfo({
  onClickLogout,
  onClickSwitchWallet,
}: {
  onClickLogout: () => void;
  onClickSwitchWallet: () => void;
}) {
  const [, setCopied] = useCopyToClipboard();
  const { wallet } = useWebLogin();
  const { chainId } = useChainId();
  const isMobile = useMobile();

  const displayAddress = useMemo(() => {
    if (!wallet.address) return '';
    const addr = shortenAddress(wallet.address);
    return `ELF_${addr}_${chainId}`;
  }, [chainId, wallet.address]);

  const copyAddress = useMemo(() => {
    return `ELF_${wallet.address}_${chainId}`;
  }, [chainId, wallet.address]);

  return (
    <Row className="account-info" align="middle" gutter={8}>
      <Col flex={'40px'}>
        <Avatar size={32} src={userAvatar} />
      </Col>
      <Col flex="auto">
        <Row gutter={10} className="account-addr-info">
          <Col>
            <Font size={16} weight="regular" lineHeight={24}>
              {displayAddress}
            </Font>
          </Col>
          <Col>
            <IconCopy
              className="icon-copy-addr"
              onClick={() => {
                setCopied(copyAddress);
                message.success('Copied success');
              }}
            />
          </Col>
        </Row>
      </Col>
      {!isMobile && (
        <Col flex={'32px'}>
          <IconSwitch className="logout-icon" onClick={onClickSwitchWallet} />
        </Col>
      )}

      <Col flex={'32px'}>
        <IconLogout className="logout-icon" onClick={onClickLogout} />
      </Col>
    </Row>
  );
}
