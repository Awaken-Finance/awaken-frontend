import { useMemo } from 'react';
import ExchangeContainer from './components/ExchangeContainer';
import SwapProvider from './hooks/useSwap';
import MobileWrap from './components/MobileWrap';
import Updater from './hooks/Updater';
import { useMobile } from 'utils/isMobile';
import LeftWrap from './components/LeftWrap';

import './Exchange.less';

const Exchange: React.FC = () => {
  const isMobile = useMobile();

  const renderContent = useMemo(() => {
    if (isMobile) {
      return <MobileWrap />;
    }

    return (
      <main className="exchange-whole-page">
        <LeftWrap />
        <ExchangeContainer />
      </main>
    );
  }, [isMobile]);

  return (
    <SwapProvider>
      <Updater />
      {renderContent}
    </SwapProvider>
  );
};
export default Exchange;
