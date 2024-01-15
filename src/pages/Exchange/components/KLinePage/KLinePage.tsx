import { useMemo } from 'react';
import { Drawer, Row, Col } from 'antd';
import clsx from 'clsx';
import { useSwapContext } from 'pages/Exchange/hooks/useSwap';
import TVContainer from '../ExchangeContainer/components/TVContainer';

import SellBtn from 'Buttons/SellBtn/SellBtn';
import CommonCard from 'components/CommonCard';
import Header from './components/Header';
import KlinePageTop from './components/KlinePageTop';
import CapitalPool from '../ExchangeContainer/components/CapitalPool';

import './KLinePage.less';

export default function KLinePage({ onClose, visible }: { visible: boolean; onClose: (type?: string) => void }) {
  const [{ pairInfo }] = useSwapContext();

  const renderContent = useMemo(() => {
    if (!pairInfo) {
      return null;
    }

    return (
      <Row>
        <Col span={24} className="kline-header-box">
          <Header pairInfo={pairInfo} onClose={onClose} className={clsx('kline-header')} />
        </Col>
        <Col span={24}>
          <Row gutter={[0, 8]}>
            <Col span={24}>
              <KlinePageTop pairInfo={pairInfo} />
            </Col>
            <Col span={24}>
              <TVContainer />
            </Col>
            <Col span={24}>
              <CapitalPool />
            </Col>
          </Row>
        </Col>
      </Row>
    );
  }, [pairInfo, onClose]);
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
      <div className="mobile-trade-pair-kline-container">
        {renderContent}
        <CommonCard title={null} className="operate-bottom-wrapper">
          <Row align="middle" gutter={[10, 0]}>
            <Col span={12}>
              <SellBtn onClick={() => onClose('buy')} />
            </Col>
            <Col span={12}>
              <SellBtn sell onClick={() => onClose('sell')} />
            </Col>
          </Row>
        </CommonCard>
      </div>
    </Drawer>
  );
}
