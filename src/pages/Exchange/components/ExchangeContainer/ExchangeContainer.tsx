import React from 'react';
import TVContainer from './components/TVContainer';
import LatestTrade from './components/LatestTrade';
import CapitalPool from './components/CapitalPool';
import ExchangePanel from './components/ExchangePanel';

import Header from './components/Header';

import './ExchangeContainer.less';

const RightWrap: React.FC = () => {
  return (
    <div className="swap-right-wrap">
      <Header />
      <div className="flex swap-content">
        <div className="center">
          <TVContainer />
          <div className="exchange-wrap">
            <ExchangePanel />
          </div>
        </div>
        <div className="right">
          <CapitalPool />
          <div className="trade-content">
            <LatestTrade />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightWrap;
