import Datafeed from './Datafeed/Datafeed';
import {
  getOverrides,
  getStudiesOverrides,
  WebSKData,
  SKItem,
  Theme,
  INTERVAL,
  INTERVAL_MOMENT,
  ButtonItem,
  Buttons,
  PairDataType,
} from './chartConfig';

import {
  LibrarySymbolInfo,
  ResolutionString,
  HistoryCallback,
  Bar,
  ErrorCallback,
  PeriodParams,
  ThemeName,
  LanguageCode,
  CustomTimezones,
} from './dts/charting_library';
import moment from 'moment';
import { UpdateKlineType } from 'socket/socketType';

export default class TV {
  interval: string;
  widgets: any;
  socket: any;
  datafeed: any;
  cacheData: any;
  lastTime: number;
  getBarTimer: NodeJS.Timeout | null;
  locale: LanguageCode;
  isLoading: boolean;
  screenFull: boolean;
  isMobile: boolean;
  name: string;
  prePairData: { [x: string]: PairDataType };
  pairData: PairDataType;
  onReadyCallback: () => void;
  constructor({
    pairData,
    SocketApi,
    isMobile,
    Locale,
    onReadyCallback = () => null,
  }: {
    pairData: PairDataType;
    SocketApi: any;
    isMobile: boolean;
    Locale?: LanguageCode;
    onReadyCallback: () => void;
  }) {
    this.widgets = null;
    this.socket = SocketApi;
    this.datafeed = new Datafeed(this);
    this.interval = localStorage.getItem('tradingview.resolution') || '1D';
    this.cacheData = {};
    this.pairData = pairData;
    this.name = `${pairData?.symbol?.replace('_', '/') || ''} ${pairData.feeRate ?? ''}`;
    this.prePairData = { [this.name]: { ...pairData } };
    this.lastTime = 0;
    this.getBarTimer = null;
    this.isLoading = true;
    this.screenFull = false;
    this.isMobile = isMobile;
    this.locale = Locale ?? 'en';
    this.onReadyCallback = onReadyCallback;
    this.socket?.on('ReceiveKlines', this.onMessage.bind(this));
    this.socket?.on('ReceiveKline', this.ReceiveKline.bind(this));
    this.init();
  }
  // TODO chart show Kline number

  init(): void {
    const resolution = this.interval;
    const chartType = +(localStorage.getItem('tradingview.chartType') ?? '1');
    let skin: Theme = 'black';
    switch (localStorage.getItem('tradingViewTheme')) {
      case 'black':
        skin = 'black';
        break;
      case 'mobile':
        skin = 'mobile';
        break;
    }

    if (this.widgets) return;
    this.widgets = new window.TradingView.widget({
      autosize: true,
      symbol: this.name,
      theme: 'Dark',
      interval: resolution as ResolutionString,
      timeframe: '240',
      loading_screen: {
        backgroundColor: this.isMobile ? '#131F30' : '#151826',
        // backgroundColor: '',
        foregroundColor: this.isMobile ? '#131F30' : '#151826',
      },
      container: 'tv_chart_container',
      datafeed: this.datafeed,
      library_path: '/charting_library/',
      enabled_features: [
        'side_toolbar_in_fullscreen_mode',
        'header_in_fullscreen_mode',
        this.isMobile ? 'hide_left_toolbar_by_default' : '',
      ],
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone as CustomTimezones,
      custom_css_url: `./static/css/tradingview_${skin}.css`, // `./css/tradingview_${skin}.css`,
      locale: this.locale,
      // debug: true, // TODO delete
      disabled_features: [
        'header_symbol_search',
        'header_saveload',
        'header_screenshot',
        'header_chart_type',
        'header_compare',
        'header_undo_redo',
        'symbol_search_hot_key',
        'border_around_the_chart',
        'timeframes_toolbar',
        'volume_force_overlay',
        'header_resolutions',
        'main_series_scale_menu', // Settings button in the lower right corner
        'header_indicators',
        'adaptive_logo',
        'caption_buttons_text_if_possible',
        'header_fullscreen_button',
        'header_settings',
        'chart_property_page_right_margin_editor',
        // this.isMobile && !this.screenFull ? 'left_toolbar' : '',
      ],
      // fullscreen: true,
      // preset: this.isMobile ? 'mobile' : undefined,
      overrides: getOverrides(skin),

      studies_overrides: getStudiesOverrides(skin),

      toolbar_bg: '#1E212B',
    });

    const thats = this.widgets;
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;

    const studies: any[] = [];
    function createStudy() {
      let id = thats.activeChart().createStudy('Moving Average', false, false, [5], null, {
        'Plot.color': 'rgb(150, 95, 196)',
      });

      studies.push(id);

      id = thats.activeChart().createStudy('Moving Average', false, false, [10], null, {
        'Plot.color': 'rgb(116,149,187)',
      });
      studies.push(id);
      id = thats.activeChart().createStudy('Moving Average', false, false, [20], null, {
        'plot.color': 'rgb(58,113,74)',
      });
      studies.push(id);
      id = thats.activeChart().createStudy('Moving Average', false, false, [30], null, {
        'plot.color': 'rgb(118,32,99)',
      });
      studies.push(id);
    }
    function toggleStudy(chartType: number) {
      const state = chartType === 3 ? false : true;
      for (let i = 0; i < studies.length; i++) {
        studies[i].then((entityId: any) => {
          thats.activeChart().getStudyById(entityId).setVisible(state);
        });
      }
    }
    function createButton(Buttons: ButtonItem[]) {
      for (let i = 0; i < Buttons.length; i++) {
        const button = Buttons[i];
        const ButtonEle: HTMLElement = thats.createButton();
        ButtonEle.setAttribute('title', button.title);
        ButtonEle.setAttribute('class', `myDate ${self.isMobile && 'mobile-resolution'}`);

        ButtonEle.textContent = button.title;
        ButtonEle.addEventListener('click', (e: Event) => {
          const currentEle = (e.currentTarget as HTMLElement)?.parentNode as HTMLElement;
          if (currentEle?.className.search('active') > -1) {
            return false;
          }
          localStorage.setItem('tradingview.resolution', button.resolution);
          localStorage.setItem('tradingview.chartType', button.chartType.toString());
          const active = ((currentEle?.parentElement as HTMLElement)?.parentElement as HTMLElement).querySelector(
            '.active',
          );
          active && (active.className = active.className.replace(/(\sactive|active\s)/, ''));
          currentEle.className += ' active';

          thats.activeChart().setResolution(button.resolution, function onReadyCallback() {
            console.log('chartReady');
          });
          if (button.chartType !== thats.activeChart().chartType()) {
            thats.activeChart().setChartType(button.chartType);
            toggleStudy(button.chartType);
          }
        });

        ButtonEle?.parentElement?.setAttribute(
          'class',
          `my-group${button.resolution === resolution && button.chartType === chartType ? ' active' : ''}`,
        );
      }

      const headerIndicators: HTMLElement = thats.createButton();
      headerIndicators.setAttribute('class', `indicators ${self.isMobile && 'mobile-indicators'}`);
      headerIndicators.addEventListener('click', () => {
        thats.activeChart().executeActionById('insertIndicator');
      });

      const FullScreen: HTMLElement = thats.createButton();
      FullScreen.setAttribute('class', `fullscreen ${self.isMobile && 'mobile-fullscreen'}`);

      FullScreen.addEventListener('click', () => {
        if (!self.screenFull) {
          thats.startFullscreen();
          // self.isMobile && thats.activeChart().executeActionById('drawingToolbarAction')
        } else {
          thats.exitFullscreen();
          // self.isMobile && thats.activeChart().executeActionById('drawingToolbarAction')
        }
        self.screenFull = !self.screenFull;
      });

      const SettingsBtn: HTMLElement = thats.createButton();
      SettingsBtn.setAttribute('class', `settings ${self.isMobile && 'mobile-settings'}`);
      SettingsBtn.addEventListener('click', () => {
        thats.activeChart().executeActionById('chartProperties');
      });
    }
    thats.onChartReady(() => {
      thats.headerReady().then(() => {
        createButton(Buttons);
      });
      thats.applyOverrides(getOverrides(skin));
      createStudy();
      thats.activeChart().setChartType(chartType);
      toggleStudy(chartType);
      this.onReadyCallback();
    });
  }

  getBars(
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    periodParams: PeriodParams,
    onLoadedCallback: HistoryCallback,
    onErrorCallback: ErrorCallback,
  ): void {
    const { from: rangeStartDate, to: rangeEndDate, firstDataRequest: isFirstCall } = periodParams;
    // this.interval = resolution;
    let ticker = `${this.name}-${resolution}`;
    const tickerLoad = `${ticker}load`;
    const tickerState = `${ticker}state`;
    //If there is no data in the cache and no request is issued, record the start time of the current node
    // Switch time or currency
    if (!this.cacheData[ticker] && !this.cacheData[tickerState]) {
      console.log('noCache to get');
      this.cacheData[tickerLoad] = rangeStartDate;
      //Initiate a request to get the current time period data from websocket
      this.initMessage(
        symbolInfo,
        resolution,
        rangeStartDate,
        rangeEndDate,
        onLoadedCallback,
        onErrorCallback,
        isFirstCall,
      );
      //Set status to true
      this.cacheData[tickerState] = true;
      return;
    }
    if (!this.cacheData[tickerLoad] || this.cacheData[tickerLoad] > rangeStartDate) {
      //If there is data in the cache, but there is no data for the current time period, update the current node time
      this.cacheData[tickerLoad] = rangeStartDate;
      //Initiate a request to get the current time period data from websocket
      this.initMessage(
        symbolInfo,
        resolution,
        rangeStartDate,
        rangeEndDate,
        onLoadedCallback,
        onErrorCallback,
        isFirstCall,
      );
      this.cacheData[tickerState] = true;
      return;
    }
    //Retrieving data from websocket, all operations are prohibited
    if (this.cacheData[tickerState]) return;

    ticker = `${this.name}-${this.interval}`;
    // Get historical data and update the chart
    if (this.cacheData[ticker] && this.cacheData[ticker].length > 1) {
      this.isLoading = false;
      const newBars: Bar[] = [];
      this.cacheData[ticker].forEach((item: Bar) => {
        if (item.time >= rangeStartDate * 1000 && item.time <= rangeEndDate * 1000) {
          newBars.push(item);
        }
      });
      onLoadedCallback(this.cacheData[ticker], { noData: false });
    } else {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const self = this;
      console.log('this.getBarTimer');
      this.getBarTimer = setTimeout(() => {
        self.getBars(symbolInfo, resolution, periodParams, onLoadedCallback, onErrorCallback);
      }, 10);
    }
  }

  initMessage(
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    rangeStartDate: number,
    rangeEndDate: number,
    onLoadedCallback: HistoryCallback,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onErrorCallback?: ErrorCallback,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isFirstCall?: boolean,
  ): void {
    const tickerCallback = `${this.name}-${resolution}Callback`;
    this.cacheData[tickerCallback] = onLoadedCallback;
    // If the current time node has changed, stop the subscription of the previous time node and modify the time node value
    if (this.interval !== resolution) {
      this.unSubscribe(this.interval);
      this.interval = resolution;
    }

    this.socket.getKline({
      from: rangeStartDate * 1000, //rangeStartDate * 1000, // 1629015605000
      chainId: this.pairData.chainId,
      tradePairId: this.pairData.tradePairId,
      type: INTERVAL[resolution],
      to: rangeEndDate * 1000,
    });
  }

  unSubscribeC(subscriberUID: string): void {
    const [name, , interval] = subscriberUID.split('_');
    const unPair = this.prePairData[name];
    if (!unPair) return;
    this.socket?.UnsubscribeKline(unPair.chainId, unPair.tradePairId, INTERVAL[interval]);
  }

  unSubscribe(interval: string): void {
    const ticker = `${this.name}-${interval}`;
    const tickerTime = `${ticker}load`;
    const tickerState = `${ticker}state`;
    const tickerCallback = `${ticker}Callback`;
    delete this.cacheData[ticker];
    delete this.cacheData[tickerTime];
    delete this.cacheData[tickerState];
    delete this.cacheData[tickerCallback];
  }

  subscribe(subscriberUID: string): void {
    const interval = subscriberUID.split('_')[2];
  }

  onMessage(data: WebSKData): void {
    const ticker = `${this.name}-${this.interval}`;
    const tickerCallback = `${ticker}Callback`;
    const onLoadedCallback = this.cacheData[tickerCallback];

    if (data.data && data.data.length) {
      const tickerState = `${ticker}state`;

      if (data.chainId !== this.pairData.chainId || data.tradePairId !== this.pairData.tradePairId) return;
      /**
       * Complementary data
       */
      const itemList: SKItem[] = [];
      let nextTime = data.data[0].timestamp || data.data[0].time;
      let nowItem = data.data[0];
      for (let i = 0; i < data.data.length; i++) {
        const item = data.data[i];
        if ((item.time || (item?.timestamp as number)) <= nextTime) {
          const now = { ...item, time: item.timestamp || item.time };
          nowItem = now;
          itemList.push(now);
          nextTime = moment(item.timestamp)
            .add(INTERVAL_MOMENT[data.period].v, INTERVAL_MOMENT[data.period].m as moment.DurationInputArg2)
            .valueOf();
        } else {
          const now = {
            time: nextTime,
            open: nowItem.close,
            high: nowItem.close,
            low: nowItem.close,
            close: nowItem.close,
            volume: 0,
          };
          itemList.push(now);
          i--;
          nextTime = moment(nextTime)
            .add(INTERVAL_MOMENT[data.period].v, INTERVAL_MOMENT[data.period].m as moment.DurationInputArg2)
            .valueOf();
        }
      }
      while (nextTime < data.to) {
        const now = {
          time: nextTime,
          open: nowItem.close,
          high: nowItem.close,
          low: nowItem.close,
          close: nowItem.close,
          volume: 0,
        };
        itemList.push(now);
        nextTime = moment(nextTime)
          .add(INTERVAL_MOMENT[data.period].v, INTERVAL_MOMENT[data.period].m as moment.DurationInputArg2)
          .valueOf();
      }
      /**
       *
       *
       */
      // If there is no cached data, fill it directly and initiate a subscription
      if (!this.cacheData[ticker]) {
        this.cacheData[ticker] = itemList;
      }
      // The new data is the data needed for the current time period, directly fed to the chart plugin
      if (onLoadedCallback) {
        onLoadedCallback(itemList);
        console.log('onLoadedCallback object');
        // delete this.cacheData[tickerCallback];
      }
      this.cacheData[tickerState] = false;
      //Record the current cache time, that is, the time of the last digit of the array
      this.lastTime = this.cacheData[ticker][this.cacheData[ticker].length - 1].time;
    } else {
      if (onLoadedCallback) {
        onLoadedCallback([]);
        delete this.cacheData[tickerCallback];
      }
    }
  }

  ReceiveKline(data: UpdateKlineType) {
    this.updateKline(data);
  }

  updateKline(data: UpdateKlineType) {
    const ticker = `${this.name}-${this.interval}`;
    const { close, open, low, volume, high, timestamp } = data;
    const barsData: SKItem = {
      close,
      open,
      low,
      volume,
      high,
      time: timestamp,
    };
    //If the time for incrementally updating data is greater than the cache time, and there is data in the cache, the data length is greater than 0
    if (this.cacheData[ticker] && this.cacheData[ticker].length) {
      if (barsData.time > this.lastTime) {
        this.cacheData[ticker].push(barsData);
        this.lastTime = barsData.time;
      } else if (barsData.time === this.lastTime) {
        this.cacheData[ticker][this.cacheData[ticker].length - 1] = barsData;
      } else if (barsData.time < this.lastTime) {
        const index = this.cacheData[ticker].findIndex(
          (ele: any) => parseInt(((ele?.time ?? 0) / 1000).toString()) === parseInt((barsData.time / 1000).toString()),
        );
        this.cacheData[ticker][index] = barsData;
      }
    }
    if (data.period === INTERVAL[this.interval]) {
      this.datafeed.barsUpdater.updateData();
    }
  }

  resetTheme(skin: Theme): void {
    this.widgets.addCustomCSSFile(`./static/css/tradingview_${skin}.css`);
    this.widgets.applyOverrides(getOverrides(skin));
    this.widgets.applyStudiesOverrides(getStudiesOverrides(skin));
  }

  setSymbol(symbolData: PairDataType, callback?: () => void): void {
    if (!symbolData) return;
    this.unSubscribe(this.interval);
    const symbol = symbolData?.symbol?.replace('_', '/') ?? '';
    this.name = `${symbol} ${symbolData.feeRate ?? ''}`;
    this.prePairData = {
      ...this.prePairData,
      [this.name]: { ...this.pairData },
    };

    this.pairData = {
      ...symbolData,
    };
    this.widgets?.chart && this.widgets?.chart().setSymbol(this.name.toLocaleUpperCase(), callback);
  }
  changeTheme(themeName: ThemeName) {
    this.widgets && this.widgets.changeTheme(themeName);
  }

  setResolution(resolution: ResolutionString, callback?: () => void) {
    this.widgets.activeChart().setResolution(resolution, callback ?? null);
  }
  startFullscreen(isFullScreen: boolean) {
    if (isFullScreen) {
      this.widgets.startFullscreen();
    } else {
      this.widgets.exitFullscreen();
    }
  }
}
