import { useMemo } from 'react';
import { Drawer, Row, Col } from 'antd';
import { useSwapContext } from 'pages/Exchange/hooks/useSwap';

import LatestTrade from '../ExchangeContainer/components/LatestTrade';
import { MobileExchangePanel } from '../ExchangeContainer/components/ExchangePanel';
import Header from '../KLinePage/components/Header';

export default function ExchangeDrawer({
  onClose,
  visible,
  sellType,
}: {
  sellType?: string;
  visible: boolean;
  onClose: (type?: string) => void;
}) {
  const [{ pairInfo }] = useSwapContext();

  const renderContent = useMemo(() => {
    if (!pairInfo) {
      return null;
    }

    return (
      <>
        <Row gutter={[0, 8]} className="exchange-mobile-wrap">
          <Col span={24} className="exchange-mobile-wrap-header">
            <Header pairInfo={pairInfo} onClose={onClose} />
          </Col>
        </Row>
        <Row gutter={[0, 8]} className="exchange-mobile-wrap">
          <Col span={24}>
            <MobileExchangePanel sellType={sellType} />
          </Col>
          <Col span={24}>
            <LatestTrade />
          </Col>
        </Row>
      </>
    );
  }, [onClose, pairInfo, sellType]);
  return (
    <Drawer
      destroyOnClose
      mask
      title=""
      width={'100%'}
      placement="left"
      closable={false}
      onClose={() => onClose()}
      visible={visible}
      zIndex={11}
      className="mobile-trade-pair-kline">
      <div>{renderContent}</div>
    </Drawer>
  );
}
