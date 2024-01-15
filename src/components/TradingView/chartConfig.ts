import {
  CustomTimezones,
  Overrides,
  StudyOverrides,
  // LibrarySymbolInfo
} from './dts/charting_library';
interface ThemeColorOne {
  up: string;
  down: string;
  bg: string;
  grid: string;
  cross: string;
  border: string;
  text: string;
  areaLine: string;
  areatop: string;
  areadown: string;
  line?: string;
  showLegend?: boolean;
}

export interface PairDataType {
  chainId: string;
  tradePairId: string;
  feeRate?: string;
  symbol: string;
}

interface ThemeColorTwo {
  c0: string;
  c1: string;
  t: number;
  v: boolean;
}

export interface SKItem {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp?: number;
}
export interface INTERVALTYPE {
  [x: string]: number;
}

// 60, 60 * 15, 60 * 30, 3600, 3600 * 4, 3600 * 24, 3600 * 24 * 7
export const INTERVAL: INTERVALTYPE = {
  '1': 60,
  '15': 60 * 15,
  '30': 60 * 30,
  '60': 3600,
  '240': 3600 * 4,
  '1D': 3600 * 24,
  '1W': 3600 * 24 * 7,
};

interface INTERVAL_MOMENT_TYPE {
  [x: string]: { v: number; m: string };
}

export const INTERVAL_MOMENT: INTERVAL_MOMENT_TYPE = {
  60: { v: 1, m: 'm' },
  [60 * 15]: { v: 15, m: 'm' },
  [60 * 30]: { v: 30, m: 'm' },
  3600: { v: 1, m: 'h' },
  [3600 * 4]: { v: 4, m: 'h' },
  [3600 * 24]: { v: 1, m: 'd' },
  [3600 * 24 * 7]: { v: 7, m: 'd' },
};

export type Theme = 'white' | 'black' | 'mobile';

export interface WebSKData {
  data?: SKItem[];
  period: number;
  currentPrice?: SKItem;
  interval?: string;
  from: number;
  to: number;
  chainId?: string;
  tradePairId: string;
}

export interface KlineReceive {
  chainId: string;
  tradePairId: string;
  period: number;
  from: number;
  to: number;
  data: SKItem[];
}

export const getOverrides = (theme: Theme): Overrides => {
  const THEMES: { [key: string]: ThemeColorOne } = {
    white: {
      up: '#03c087',
      down: '#fa4d56',
      bg: '#ffffff',
      grid: '#f7f8fa',
      cross: '#23283D',
      border: '#9194a4',
      text: '#9194a4',
      areaLine: '#2A2E3A',
      areatop: 'rgba(71, 78, 112, 0.1)',
      areadown: 'rgba(71, 78, 112, 0.02)',
      line: '#737375',
    },
    black: {
      up: '#1BC57D',
      down: '#E43555',
      bg: '#181B23',
      grid: '#1E212B',
      cross: '#9BA0B0',
      border: '#4e5b85',
      text: '#9BA0B0',
      areaLine: '#2A2E3A',
      areatop: 'rgba(122, 152, 247, .1)',
      areadown: 'rgba(122, 152, 247, .02)',
      line: '#737375',
    },
    mobile: {
      up: '#1BC57D',
      down: '#E43555',
      bg: '#181B23',
      grid: '#1E212B',
      cross: '#9BA0B0',
      border: '#4e5b85',
      text: '#9BA0B0',
      areaLine: '#2A2E3A',
      areatop: 'rgba(71, 78, 112, 0.1)',
      areadown: 'rgba(71, 78, 112, 0.02)',
      showLegend: true,
    },
  };
  const t = THEMES[theme];
  return {
    volumePaneSize: 'medium',
    'scalesProperties.lineColor': t.areaLine,
    'scalesProperties.textColor': t.text,
    'paneProperties.background': t.bg,
    'paneProperties.vertGridProperties.color': t.grid,
    'paneProperties.vertGridProperties.style': 1,
    'paneProperties.horzGridProperties.color': t.grid,
    'paneProperties.horzGridProperties.style': 1,
    'paneProperties.crossHairProperties.color': t.cross,
    'paneProperties.legendProperties.showLegend': !!t.showLegend,
    'paneProperties.legendProperties.showStudyArguments': true,
    'paneProperties.legendProperties.showStudyTitles': true,
    'paneProperties.legendProperties.showStudyValues': true,
    'paneProperties.legendProperties.showSeriesTitle': true,
    'paneProperties.legendProperties.showSeriesOHLC': true,
    'mainSeriesProperties.style': 1,
    'mainSeriesProperties.candleStyle.upColor': t.up,
    'mainSeriesProperties.candleStyle.downColor': t.down,
    'mainSeriesProperties.candleStyle.drawWick': true,
    'mainSeriesProperties.candleStyle.drawBorder': true,
    'mainSeriesProperties.candleStyle.borderColor': t.border,
    'mainSeriesProperties.candleStyle.borderUpColor': t.up,
    'mainSeriesProperties.candleStyle.borderDownColor': t.down,
    'mainSeriesProperties.candleStyle.wickUpColor': t.up,
    'mainSeriesProperties.candleStyle.wickDownColor': t.down,
    'mainSeriesProperties.candleStyle.barColorsOnPrevClose': false,
    'mainSeriesProperties.hollowCandleStyle.upColor': t.up,
    'mainSeriesProperties.hollowCandleStyle.downColor': t.down,
    'mainSeriesProperties.hollowCandleStyle.drawWick': true,
    'mainSeriesProperties.hollowCandleStyle.drawBorder': true,
    'mainSeriesProperties.hollowCandleStyle.borderColor': t.border,
    'mainSeriesProperties.hollowCandleStyle.borderUpColor': t.up,
    'mainSeriesProperties.hollowCandleStyle.borderDownColor': t.down,
    'mainSeriesProperties.hollowCandleStyle.wickColor': t?.line ?? false,
    'mainSeriesProperties.haStyle.upColor': t.up,
    'mainSeriesProperties.haStyle.downColor': t.down,
    'mainSeriesProperties.haStyle.drawWick': true,
    'mainSeriesProperties.haStyle.drawBorder': true,
    'mainSeriesProperties.haStyle.borderColor': t.border,
    'mainSeriesProperties.haStyle.borderUpColor': t.up,
    'mainSeriesProperties.haStyle.borderDownColor': t.down,
    'mainSeriesProperties.haStyle.wickColor': t.border,
    'mainSeriesProperties.haStyle.barColorsOnPrevClose': false,
    'mainSeriesProperties.barStyle.upColor': t.up,
    'mainSeriesProperties.barStyle.downColor': t.down,
    'mainSeriesProperties.barStyle.barColorsOnPrevClose': false,
    'mainSeriesProperties.barStyle.dontDrawOpen': false,
    'mainSeriesProperties.lineStyle.color': t.border,
    'mainSeriesProperties.lineStyle.linewidth': 1,
    'mainSeriesProperties.lineStyle.priceSource': 'close',
    'mainSeriesProperties.areaStyle.color1': t.areatop,
    'mainSeriesProperties.areaStyle.color2': t.areadown,
    'mainSeriesProperties.areaStyle.linecolor': t.border,
    'mainSeriesProperties.areaStyle.linewidth': 1,
    'mainSeriesProperties.areaStyle.priceSource': 'close',
  };
};

export const getStudiesOverrides = (theme: 'white' | 'black' | 'mobile'): StudyOverrides => {
  const THEMES: { [key: string]: ThemeColorTwo } = {
    white: {
      c0: '#eb4d5c',
      c1: '#53b987',
      t: 70,
      v: false,
    },
    black: {
      c0: '#FA4D56',
      c1: '#00B464',
      t: 70,
      v: false,
    },
    mobile: {
      c0: '#FA4D56',
      c1: '#00B464',
      t: 70,
      v: false,
    },
  };
  const t = THEMES[theme];
  return {
    'volume.volume.color.0': t.c0,
    'volume.volume.color.1': t.c1,
    'volume.volume.transparency': t.t,
    'volume.options.showStudyArguments': t.v,
  };
};

export const defaultSymbol = (symbol: string): any => {
  return {
    name: symbol.toLocaleUpperCase(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone as CustomTimezones,
    minmov: 1,
    minmov2: 0,
    pointvalue: 1,
    fractional: false,
    session: '24x7', // set cycle
    has_intraday: true,
    has_no_volume: false,
    has_empty_bars: true,
    has_daily: true, // Set whether to support week-month line
    has_weekly_and_monthly: true, // Set whether to support week-month line
    description: symbol.toLocaleUpperCase(),
    pricescale: 100000,
    ticker: symbol.toLocaleUpperCase(),
    supported_resolutions: [
      '1',
      // '5m',
      '15',
      '30',
      '60',
      '240',
      '1D',
      '1W',
      // '1W',
      // '1M',
    ],
  };
};

export interface ButtonItem {
  title: string;
  resolution: string;
  chartType: number;
}

export const Buttons: ButtonItem[] = [
  { title: '1m', resolution: '1', chartType: 1 },
  { title: '15m', resolution: '15', chartType: 1 },
  { title: '30m', resolution: '30', chartType: 1 },
  { title: '1h', resolution: '60', chartType: 1 },
  { title: '4h', resolution: '240', chartType: 1 },
  { title: '1d', resolution: '1D', chartType: 1 },
  { title: '1w', resolution: '1W', chartType: 1 },
];
