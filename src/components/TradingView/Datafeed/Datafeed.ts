import {
  LibrarySymbolInfo,
  ResolutionString,
  HistoryCallback,
  ErrorCallback,
  SubscribeBarsCallback,
  PeriodParams,
} from '../dts/charting_library';
import { defaultSymbol, INTERVAL } from '../chartConfig';
import DataUpdater from './DataUpdater';
import moment from 'moment';

/** JS API **/

export default class Datafeed {
  self: any;
  barsUpdater: any;
  constructor(self: any) {
    this.self = self;
    this.barsUpdater = new DataUpdater(this);
    this.defaultConfiguration = this.defaultConfiguration.bind(this);
  }
  onReady(callback: (data: any) => void) {
    return new Promise((resolve) => {
      let configuration = this.defaultConfiguration();
      if (this.self.getConfig) {
        configuration = Object.assign(this.defaultConfiguration(), this.self.getConfig());
      }
      resolve(configuration);
    }).then((data) => callback(data));
  }

  defaultConfiguration = () => {
    return {
      supports_search: false,
      supports_group_request: false,
      supported_resolutions: ['1', '15', '30', '60', '240', '1D', '1W'],
      supports_marks: false,
      supports_timescale_marks: false,
      supports_time: false,
    };
  };

  resolveSymbol(
    symbolName: string,
    onSymbolResolvedCallback: (data: any) => void,
    onResolveErrorCallback: (data: any) => void,
  ) {
    return new Promise((resolve) => {
      let symbolInfo = defaultSymbol(symbolName);
      if (this.self.getSymbol) {
        symbolInfo = Object.assign(defaultSymbol(symbolName), this.self.getSymbol());
      }
      resolve(symbolInfo);
    })
      .then(function (data) {
        return onSymbolResolvedCallback(data);
      })
      .catch(function (err) {
        return onResolveErrorCallback(err);
      });
  }

  /**
   * @param {*Object} symbolInfo
   * @param {*String} resolution
   * @param {*Number} rangeStartDate
   * @param {*Number} rangeEndDate
   * @param {*Function} onDataCallback
   * @param {*Function} onErrorCallback
   */

  getBars(
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    periodParams: PeriodParams,
    onDataCallback: HistoryCallback,
    onErrorCallback: ErrorCallback,
  ) {
    const { from, to, countBack } = periodParams;
    //  ((TimestampMax - TimestampMin) / Period >   1000)
    let rangeStartDate = from;
    let count = countBack;
    let rangeEndDate = to;
    if (moment().unix() <= to) {
      rangeEndDate = moment().unix();
    }
    if (countBack > 1000) {
      const timestampMax = rangeEndDate - 999 * INTERVAL[resolution];
      const time = isNaN(timestampMax) || timestampMax < 0 ? rangeEndDate.toString() : timestampMax.toString();
      rangeStartDate = parseInt(time);
      count = 999;
    }
    const period = {
      ...periodParams,
      from: rangeStartDate,
      to: rangeEndDate,
      countBack: count,
    };
    const onLoadedCallback = (data: any) => {
      data && data.length ? onDataCallback(data, { noData: false }) : onDataCallback([], { noData: true });
    };
    this.self.getBars(symbolInfo, resolution, period, onLoadedCallback, onErrorCallback);
  }

  subscribeBars(
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    onRealtimeCallback: SubscribeBarsCallback,
    subscriberUID: string,
    onResetCacheNeededCallback: () => void,
  ): void {
    this.barsUpdater.subscribeBars(
      symbolInfo,
      resolution,
      onRealtimeCallback,
      subscriberUID,
      onResetCacheNeededCallback,
    );
    this.self.subscribe(subscriberUID);
  }

  unsubscribeBars(subscriberUID: string) {
    this.barsUpdater.unsubscribeBars(subscriberUID);
    this.self.unSubscribeC(subscriberUID);
  }
}
