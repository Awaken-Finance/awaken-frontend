import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { stringCut } from 'utils/string';
import * as echarts from 'echarts';
import './styles.less';
import { ZERO } from 'constants/misc';
import { formatPriceUSD } from 'utils/price';
import { useMobile } from 'utils/isMobile';

export type TPortfolioChartDataItem = {
  value: number;
  name: string;
};

export type TPortfolioChartProps = {
  data: TPortfolioChartDataItem[];
};

export const PortfolioChart = ({ data }: TPortfolioChartProps) => {
  const isMobile = useMobile();
  const ele = useRef<HTMLElement>();
  const [myChart, setMyChart] = useState<echarts.ECharts>();
  useEffect(() => {
    if (!myChart) {
      const chart = echarts.init(ele.current as HTMLDivElement, undefined, {
        renderer: 'svg',
      });
      setMyChart(chart);
    }
  }, [myChart]);

  useEffect(() => {
    const option: echarts.EChartsOption = {
      tooltip: {
        show: true,
      },
      legend: {
        bottom: 0,
        left: 'center',
        itemHeight: 10,
        itemWidth: 10,
        icon: 'circle',
        textStyle: {
          color: '#9BA0B0',
          fontSize: 12,
          fontFamily: 'RobotoRegular',
        },
        itemGap: 12,
        formatter: function (name: string) {
          return stringCut(name, 10);
        },
        tooltip: {
          show: true,
          textStyle: {
            color: '#E5E8EF',
            lineHeight: 22,
            fontFamily: 'RobotoRegular',
          },
          backgroundColor: '#484E60',
        },
      },
      color: ['#7453FA', '#44A96C', '#E75558', '#4880FF', '#D09F40', '#41C1CD', '#fc8452', '#9a60b4', '#ea7ccc'],
      series: [
        {
          top: isMobile ? '-40%' : '-27%',
          name: '',
          type: 'pie',
          radius: isMobile ? ['26.45%', '38.632%'] : ['36.75%', '52.5%'],
          avoidLabelOverlap: false,
          // padAngle: 1,
          itemStyle: {
            // borderRadius: 2,
          },
          tooltip: {
            show: false,
          },
          label: {
            show: false,
            position: 'center',
          },
          emphasis: {
            label: {
              show: true,
              fontSize: isMobile ? 10 : 16,
              fontWeight: 'bold',
              color: '#E5E8EF',
              lineHeight: isMobile ? 14 : 22,
              fontFamily: 'RobotoRegular',
              formatter: (item) => {
                return `${stringCut(item.name, 8)}\n${
                  Number(item.value ?? 0) < 0.01 ? '< $0.01' : `$${formatPriceUSD(ZERO.plus(Number(item.value ?? 0)))}`
                }`;
              },
            },
            scaleSize: isMobile ? 3.75 : 5,
          },
          emptyCircleStyle: {
            color: '#2A2E3A',
          },
          labelLine: {
            show: false,
          },
          data,
        },
      ],
    };

    myChart?.setOption(option, true);
  }, [data, isMobile, myChart]);

  useEffect(() => {
    if (!myChart) return;

    const resize = () => myChart.resize();
    const timer = setTimeout(resize, 1);
    window.addEventListener('resize', resize);

    return () => {
      timer && clearTimeout(timer);
      window.removeEventListener('resize', resize);
    };
  }, [myChart]);

  return (
    <div className="portfolio-overview-chart-wrap">
      <div ref={ele as any} className={clsx('portfolio-overview-chart-box')} />
    </div>
  );
};
