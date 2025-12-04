import { forwardRef } from 'react';
import { Empty, Spin } from 'antd';
import './ECharts.less';
import Charts from './Charts';
import clsx from 'clsx';
import { EChartsOption } from 'echarts';
const ECharts = forwardRef(
  (
    {
      disabled,
      loading,
      className,
      noData,
      option,
    }: {
      disabled?: boolean;
      noData?: boolean;
      loading?: boolean;
      option?: EChartsOption;
      className?: string;
    },
    ref,
  ) => {
    if (loading) {
      return (
        <div className={clsx('echarts-box', className)}>
          <Spin className="echarts-loading" size="large" />
        </div>
      );
    }
    if (noData) {
      return <Empty className={clsx('echarts-box', className)} />;
    }
    return <Charts ref={ref} option={option} disabled={disabled} className={className} />;
  },
);

// export interface echartsInstance {
//   myChart: EChartsType;
// }
export default ECharts;
