import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import * as echarts from 'echarts';
import './ECharts.less';
import clsx from 'clsx';
import { useDeepCompareEffect } from 'react-use';
const Charts = forwardRef(
  (
    {
      disabled,
      option,
      className,
    }: {
      option?: echarts.EChartOption | echarts.EChartsResponsiveOption;
      disabled?: boolean;
      className?: string;
    },
    ref,
  ) => {
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
      if (myChart) {
        const resize = () => myChart.resize();
        const timer = setTimeout(resize, 1);
        window.addEventListener('resize', resize);

        return () => {
          timer && clearTimeout(timer);
          window.removeEventListener('resize', resize);
        };
      }
    }, [myChart]);

    useDeepCompareEffect(() => {
      option &&
        myChart?.setOption(
          {
            ...option,
          },
          true,
        );
    }, [myChart, option || {}]);

    useImperativeHandle(
      ref,
      () => ({
        myChart,
      }),
      [myChart],
    );
    return (
      <div
        style={{
          position: 'relative',
          ...(disabled ? { pointerEvents: 'none', background: '#f0f0f0' } : {}),
        }}>
        <div ref={ele as any} className={clsx('echarts-box', className)} />
      </div>
    );
  },
);
export default Charts;
