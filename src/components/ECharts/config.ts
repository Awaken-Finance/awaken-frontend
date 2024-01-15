import BigNumber from 'bignumber.js';
import { EChartOption, EChartsResponsiveOption } from 'echarts';
import { TFunction } from 'react-i18next';
import { formatPrice, formatTokenAmount } from 'utils/price';
const DepthGrid = {
  containLabel: true,
  top: '60px',
  left: 0,
  right: '20px',
  bottom: '6px',
};

const graphic = [
  {
    type: 'group',
    z: 100,
    children: [
      {
        type: 'text',
        left: 'center',
        top: 'center',
        z: 999,
        cursor: 'default',
        style: {
          fill: 'rgba(0,0,0,0.4)',
          text: 'TERMITE',
          font: 'bold 20px sans-serif',
        },
      },
    ],
  },
];

const DepthTooltip: (pairInfo: any, t: TFunction<'translation'>, isMobile: boolean) => EChartOption.Tooltip = (
  pairInfo,
  t,
  isMobile,
) => {
  return {
    trigger: 'axis',
    confine: true,
    snap: true,
    padding: 0,
    borderWidth: 0,
    backgroundColor: 'rgba(0, 0, 0, 0)',
    formatter: (param: EChartOption.Tooltip.Format | EChartOption.Tooltip.Format[]) => {
      const [x, , token0Volume, token1Volume, changes] = (param as EChartOption.Tooltip.Format[])?.[0]?.data ?? [
        0, 0, 0, 0, 0,
      ];
      return `
      <div class="depth-chart-tooltip-wrap ${isMobile && 'depth-chart-tooltip-wrap-mobile'}">
        <div class="item price">
          <div>${t('price')}</div>
          <div>${formatPrice(x)}</div>
        </div>
        <div class="item changes">
          <div>${t('change')}</div>
          <div class="${
            new BigNumber(changes).isZero() ? '' : changes > 0 ? 'font-color-fall' : 'font-color-rise'
          }">${new BigNumber(changes || '0.00').abs()}%</div>
        </div>
        <div class="item token">
          <span>
            ${pairInfo?.token0?.symbol} ${t('amount')}
          </span>
          <span>${formatTokenAmount(token0Volume)}</span>
        </div>
        <div class="item token">
          <span>
            ${pairInfo?.token1?.symbol} ${t('amount')}
          </span>
          <span>${formatTokenAmount(token1Volume)}</span>
        </div>
      </div>
    `;
    },
  };
};

const DepthOption: (isMobile: boolean) => EChartOption | EChartsResponsiveOption = (isMobile) => ({
  backgroundColor: 'var(--ant-k-line-bg-color)',
  title: {
    show: false,
  },
  yAxis: {
    type: 'value',
    splitNumber: 5,
    splitLine: { show: false },
    position: 'right',
    nameGap: 8,
    animation: true,
    axisLine: {
      show: true,
      lineStyle: {
        width: 1,
        color: '#2A2E3A',
      },
    },
    axisLabel: {
      color: '#9BA0B0',
      fontSize: 12,
      lineHeight: 14,
      formatter: (value: string) => {
        return formatTokenAmount(new BigNumber(value));
      },
    },
  },
  xAxis: {
    type: 'category',
    splitNumber: 5,
    splitLine: { show: false },
    nameGap: 8,
    axisTick: {
      show: false,
    },
    axisLine: {
      show: false,
    },
    axisLabel: {
      color: '#9BA0B0',
      fontSize: 12,
      lineHeight: 14,
      interval: (index: number) => {
        if (isMobile && [250, 500, 750].includes(index)) {
          return true;
        }
        if (!isMobile && [166, 332, 500, 666, 832].includes(index)) {
          return true;
        }

        return false;
      },
      formatter: (value: string) => {
        return formatPrice(value);
      },
    },
    axisPointer: {
      show: true,
      type: 'line',
      label: {
        show: false,
      },
      lineStyle: {
        width: 1,
        color: 'var(--ant-black-font-color-2)',
      },
    },
  },
});
const DepthSeries: (buy: string[][], sell: string[][], t: TFunction<'translation'>) => any = (buy, sell, t) => [
  {
    name: 'sell',
    type: 'line',
    symbol: 'circle',
    smooth: true,
    symbolSize: 8,
    showSymbol: false,
    label: {
      show: false,
      distance: 22,
      color: '#fff',
      fontSize: 12,
      align: 'center',
      verticalAlign: 'middle',
      backgroundColor: '#222E5D',
      padding: [10, 15, 10, 15],
    },
    connectNulls: true,
    step: false,
    itemStyle: {
      color: '#01C57B',
      borderColor: 'rgba(1, 197, 123, 0.4)',
      borderWidth: 7,
    },
    lineStyle: {
      width: 2,
      color: '#1BC57D',
    },
    areaStyle: {
      color: 'rgb(27, 197, 125, 0.15)',
    },
    emphasis: {
      areaStyle: {
        color: 'rgb(27, 197, 125, 0.15)',
      },
    },
    data: sell,
  },
  {
    name: 'buy',
    type: 'line',
    symbol: 'circle',
    smooth: true,
    showSymbol: false,
    symbolSize: 8,
    label: {
      show: false,
      distance: 22,
      color: '#fff',
      fontSize: 12,
      align: 'center',
      verticalAlign: 'middle',
      backgroundColor: '#222E5D',
      padding: [10, 15, 10, 15],
    },
    connectNulls: true,
    step: false,
    stack: t('totalVol'),
    itemStyle: {
      color: '#D8195A',
      borderWidth: 7,
      borderColor: 'rgba(216, 25, 90, 0.4)',
    },
    areaStyle: {
      color: 'rgb(228, 53, 85, 0.15)',
    },
    emphasis: {
      areaStyle: {
        color: 'rgb(228, 53, 85, 0.15)',
      },
    },
    lineStyle: {
      width: 2,
      color: '#E43555',
    },
    data: buy,
  },
];

export default {
  DepthGrid,
  graphic,
  DepthSeries,
  DepthOption,
  DepthTooltip,
};
