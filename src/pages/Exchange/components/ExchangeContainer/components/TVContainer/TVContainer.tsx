import TradingView from 'components/TradingView/TradingView';
import { useMobile } from 'utils/isMobile';
import clsx from 'clsx';
import { useCallback, useMemo, useState } from 'react';
import { usePrevious, useUpdateEffect } from 'react-use';
import { useParams } from 'react-router-dom';
import CommonLoading from 'components/CommonLoading';
import DepthChart from 'pages/Exchange/components/DepthChart';
import CommonMenu from 'components/CommonMenu';
import { chartTuple } from './constants';

import './TVContainer.less';

const TVContainer = () => {
  const isMobile = useMobile();
  const [loading, setLoading] = useState<boolean>(true);
  const [chartType, setChartType] = useState<string | number>('original');

  const params = useParams<{ id?: string }>();
  const preParams = usePrevious(params);

  const chartTypeChange = useCallback(
    (type: string | number) => {
      if (chartType === type) {
        return;
      }
      setLoading(true);
      setChartType(type);
    },
    [chartType],
  );

  useUpdateEffect(() => {
    if (preParams?.id === params.id) {
      return;
    }
    setLoading(true);
  }, [params.id]);

  const renderContent = useMemo(() => {
    if (isMobile) {
      return (
        <>
          <div className="mobile-menu-box">
            <CommonMenu
              menus={chartTuple}
              onChange={chartTypeChange}
              value={chartType}
              className="center-container-switch center-container-switch-mobile"
            />
          </div>
          <div className="mobile-chart-box">
            <CommonLoading spinning={loading}>
              {chartType === 'original' ? (
                <TradingView setLoading={setLoading} />
              ) : (
                <DepthChart setLoading={setLoading} />
              )}
            </CommonLoading>
          </div>
        </>
      );
    }

    return (
      <CommonLoading spinning={loading}>
        <CommonMenu
          menus={chartTuple}
          onChange={chartTypeChange}
          value={chartType}
          className="center-container-switch"
        />
        {chartType === 'original' ? (
          <TradingView setLoading={setLoading} />
        ) : (
          <>
            <div className="center-container-position"></div>
            <DepthChart setLoading={setLoading} />
          </>
        )}
      </CommonLoading>
    );
  }, [chartType, chartTypeChange, isMobile, loading]);

  return <div className={clsx('center-container', isMobile && 'mobile-container')}>{renderContent}</div>;
};

export default TVContainer;
