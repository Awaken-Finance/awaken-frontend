import { useMemo } from 'react';
import { Row, Col } from 'antd';
import { useSwapContext } from 'pages/Exchange/hooks/useSwap';
import TVContainer from '../ExchangeContainer/components/TVContainer';

import SellBtn from 'Buttons/SellBtn/SellBtn';
import CommonCard from 'components/CommonCard';
import KlinePageTop from './components/KlinePageTop';
import CapitalPool from '../ExchangeContainer/components/CapitalPool';

import './KLinePage.less';

export default function KLinePageInner({ changeTrade }: { changeTrade?: (type?: string) => void }) {
  const [{ pairInfo }] = useSwapContext();

  const renderContent = useMemo(() => {
    if (!pairInfo) {
      return null;
    }

    return (
      <Row>
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
  }, [pairInfo]);

  return (
    <div className="mobile-trade-pair-kline-container">
      {renderContent}
      <CommonCard title={null} className="operate-bottom-wrapper kline-operate-bottom-wrapper">
        <Row align="middle" gutter={[10, 0]}>
          <Col span={12}>
            <SellBtn checkAuth={false} onClick={() => changeTrade?.('buy')} />
          </Col>
          <Col span={12}>
            <SellBtn checkAuth={false} sell onClick={() => changeTrade?.('sell')} />
          </Col>
        </Row>
      </CommonCard>
    </div>
  );
}
