import { useCallback, useState } from 'react';
import { Row, Col } from 'antd';
import DrawerTradePair from '../DrawerTradePair';
import Header from './components/Header';

import './MobileWrap.less';
import KlinePageInner from '../KLinePage/KlinePageInner';
import ExchangeDrawer from '../ExchangeDrawer';
import { LoadPageLoading } from 'components/Loading';
import { useSwapContext } from 'pages/Exchange/hooks/useSwap';

export default function MobileWrap() {
  const [sliderType, setSliderType] = useState<string>('');
  const [sellType, setSellType] = useState<string>('');
  const [{ pairInfo }] = useSwapContext();

  const openSlider = useCallback(
    (v: string) => {
      if (v === sliderType) {
        return;
      }
      setSliderType(v);
    },
    [sliderType],
  );

  const changeTrade = (type?: string) => {
    setSliderType('');

    type && ['sell', 'buy'].includes(type) && type !== sellType && setSellType(type);
  };

  return (
    <>
      {!pairInfo && <LoadPageLoading type="page" />}

      <Row gutter={[0, 8]} className="exchange-mobile-wrap">
        <Col span={24} className="exchange-mobile-wrap-header">
          <Header openTradePair={() => openSlider('tradePair')} openKlinePage={() => openSlider('Exchange')} />
        </Col>
      </Row>
      <KlinePageInner
        changeTrade={async (type) => {
          type && ['sell', 'buy'].includes(type) && type !== sellType && setSellType(type);
          openSlider('Exchange');
        }}
      />

      <DrawerTradePair onClose={() => changeTrade()} visible={sliderType === 'tradePair'} />

      <ExchangeDrawer sellType={sellType} onClose={changeTrade} visible={sliderType === 'Exchange'} />
    </>
  );
}
