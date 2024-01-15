import { useCallback, useState } from 'react';
import { Row, Col } from 'antd';
import KLinePage from '../KLinePage';
import { MobileExchangePanel } from '../ExchangeContainer/components/ExchangePanel';
import DrawerTradePair from '../DrawerTradePair';
import Header from './components/Header';
import LatestTrade from '../ExchangeContainer/components/LatestTrade/LatestTrade';

import './MobileWrap.less';

export default function MobileWrap() {
  const [sliderType, setSliderType] = useState<string>('');

  const [sellType, setSellType] = useState<string>('');

  const openSlider = useCallback(
    (v) => {
      if (v === sliderType) {
        return;
      }
      setSliderType(v);
    },
    [sliderType],
  );

  const onClose = (type?: string) => {
    setSliderType('');

    type && ['sell', 'buy'].includes(type) && type !== sellType && setSellType(type);
  };

  return (
    <>
      <Row gutter={[0, 8]} className="exchange-mobile-wrap">
        <Col span={24} className="exchange-mobile-wrap-header">
          <Header openTradePair={() => openSlider('tradePair')} openKlinePage={() => openSlider('kLinePage')} />
        </Col>
        <Col span={24}>
          <MobileExchangePanel sellType={sellType} />
        </Col>
        <Col span={24}>
          <LatestTrade />
        </Col>
      </Row>
      <DrawerTradePair onClose={() => onClose()} visible={sliderType === 'tradePair'} />
      <KLinePage onClose={onClose} visible={sliderType === 'kLinePage'} />
    </>
  );
}
