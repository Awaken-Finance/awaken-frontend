import { LibrarySymbolInfo, ResolutionString, SubscribeBarsCallback, Bar } from '../dts/charting_library';
export default class DataUpdater {
  subscribers: {
    [x: string]: {
      lastBarTime: number | null;
      listener: SubscribeBarsCallback;
      resolution: ResolutionString;
      symbolInfo: LibrarySymbolInfo;
    };
  };
  requestsPending: number;
  historyProvider: any;
  constructor(dataFeeds: any) {
    this.subscribers = {};
    this.requestsPending = 0;
    this.historyProvider = dataFeeds;
  }

  subscribeBars(
    symbolInfo: LibrarySymbolInfo,
    resolution: ResolutionString,
    newDataCallback: SubscribeBarsCallback,
    listenerGuid: string,
  ) {
    this.subscribers[listenerGuid] = {
      lastBarTime: null,
      listener: newDataCallback,
      resolution: resolution,
      symbolInfo: symbolInfo,
    };
  }

  unsubscribeBars(listenerGuid: string) {
    this.requestsPending = 0;
    delete this.subscribers[listenerGuid];
  }

  updateData() {
    if (this.requestsPending) return;
    this.requestsPending = 0;
    for (const listenerGuid in this.subscribers) {
      this.requestsPending++;
      this.updateDataForSubscriber(listenerGuid)
        .then(() => {
          return this.requestsPending--;
        })
        .catch(() => {
          return this.requestsPending--;
        });
    }
  }

  updateDataForSubscriber(listenerGuid: string) {
    return new Promise((resolve, reject) => {
      const subscriptionRecord = this.subscribers[listenerGuid];
      const rangeEndTime = parseInt((Date.now() / 1000).toString());
      const rangeStartTime = rangeEndTime - this.periodLengthSeconds(subscriptionRecord.resolution, 10);
      const periodParams = {
        from: rangeStartTime,
        to: rangeEndTime,
        firstDataRequest: false,
      };
      this.historyProvider.getBars(
        subscriptionRecord.symbolInfo,
        subscriptionRecord.resolution,
        periodParams,
        (bars: Bar[]) => {
          this.onSubscriberDataReceived(listenerGuid, bars);
          resolve(null);
        },
        function () {
          reject();
        },
      );
    });
  }

  periodLengthSeconds(resolution: ResolutionString, requiredPeriodsCount: number) {
    let daysCount = 0;
    if (resolution === 'D' || resolution === '1D') {
      daysCount = requiredPeriodsCount;
    } else if (resolution === 'M' || resolution === '1M') {
      daysCount = 31 * requiredPeriodsCount;
    } else if (resolution === 'W' || resolution === '1W') {
      daysCount = 7 * requiredPeriodsCount;
    } else {
      daysCount = (requiredPeriodsCount * parseInt(resolution)) / (24 * 60);
    }
    return daysCount * 24 * 60 * 60;
  }

  onSubscriberDataReceived(listenerGuid: string, bars: Bar[]) {
    if (!this.subscribers[listenerGuid]) return;
    if (!bars.length) return;
    const lastBar = bars[bars.length - 1];
    const subscriptionRecord = this.subscribers[listenerGuid];
    if (subscriptionRecord.lastBarTime !== null && lastBar.time < subscriptionRecord.lastBarTime) {
      subscriptionRecord.listener(lastBar);
      return;
    }
    const isNewBar = subscriptionRecord.lastBarTime !== null && lastBar.time > subscriptionRecord.lastBarTime;
    if (isNewBar) {
      if (bars.length < 2) {
        throw new Error('Not enough bars in history for proper pulse update. Need at least 2.');
      }
      const previousBar = bars[bars.length - 2];
      subscriptionRecord.listener(previousBar);
    }

    subscriptionRecord.lastBarTime = lastBar.time;
    subscriptionRecord.listener(lastBar);
  }
}
