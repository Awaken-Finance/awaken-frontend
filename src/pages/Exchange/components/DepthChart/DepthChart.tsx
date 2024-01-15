import { Dispatch, SetStateAction, useMemo } from 'react';
import config from 'components/ECharts/config';
import ECharts from 'components/ECharts';
import getDepthChartData from 'utils/getDepthChartData';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { useMobile } from 'utils/isMobile';
import { useSwapContext } from 'pages/Exchange/hooks/useSwap';
import './DepthChart.less';

export default function DepthChart({ setLoading = () => null }: { setLoading?: Dispatch<SetStateAction<boolean>> }) {
  const { t } = useTranslation();
  const isMobile = useMobile();
  const [{ pairInfo }] = useSwapContext();

  const [buyData, sellData] = useMemo(() => {
    if (!pairInfo) {
      return [[], []];
    }

    const data = getDepthChartData(pairInfo.price, pairInfo.valueLocked0, pairInfo.valueLocked1, pairInfo.feeRate);

    if (!data) {
      return [[], []];
    }

    const sell = data.ask.map(({ a, p, detail: { token0Volume, token1Volume, changes } }) => [
      p,
      a,
      token0Volume,
      token1Volume,
      changes,
    ]);

    const buy = data.bid
      .map(({ a, p, detail: { token0Volume, token1Volume, changes } }) => [p, a, token0Volume, token1Volume, changes])
      .reverse();

    setTimeout(() => {
      setLoading(false);
    }, 1000);

    return [buy, sell];
  }, [pairInfo, setLoading]);

  const depthOption = useMemo(
    () => ({
      ...config.DepthOption(isMobile),
      grid: config.DepthGrid,
      tooltip: config.DepthTooltip(pairInfo, t, isMobile),
      series: config.DepthSeries(sellData ?? [['0', '0']], buyData ?? [['0', '0']], t),
    }),
    [buyData, pairInfo, isMobile, sellData, t],
  );

  return <ECharts className={clsx('depth-charts', isMobile && 'depth-charts-mobile')} option={depthOption} />;
}
