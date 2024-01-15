import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { KLineParam, Receive } from './socketType';
import apiConfig from 'config/apiConfig';

const receiveEvent: string[] = [
  'ReceiveKlines',
  'ReceiveKline',

  'ReceiveTradeRecords',
  'ReceiveTradeRecord',
  'ReceiveRemovedTradeRecord',

  'ReceiveUserTradeRecords',
  'ReceiveUserTradeRecord',
  'ReceiveRemovedUserTradeRecord',

  'ReceiveTradePairDetail',

  'ReceiveTradePair',
];

export default class Signalr {
  url: string;
  signalr: HubConnection | null;
  connectionId: string;
  messageMap: { [x: string]: ((data?: any) => void)[] };
  constructor(url?: string) {
    this.url = url ?? `${apiConfig.socket}/signalr-hubs/trade`;
    this.connectionId = '';
    this.messageMap = {};
    this.signalr = null;
  }

  doOpen() {
    const signalr = new HubConnectionBuilder().withUrl(this.url).withAutomaticReconnect().build();
    this.listener(signalr);
    signalr.onclose((err) => {
      console.log('onclose', err);
    });
    return new Promise((resolve, reject) => {
      signalr
        .start()
        .then(() => {
          this.connectionId = signalr.connectionId ?? '';
          this.signalr = signalr;
          resolve(signalr);
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  listener(signalr: HubConnection) {
    try {
      receiveEvent.map((eventName: string) => {
        signalr.on(eventName, <T>(data: T) => {
          this.onReceiver({ Event: eventName, Data: data });
        });
      });
    } catch (e) {
      console.error(e, 'listener');
    }
  }

  onReceiver(data: Receive): void {
    try {
      const callback = this.messageMap[data.Event];
      if (!callback?.length) {
        return;
      }

      callback.forEach((handler) => {
        handler(data.Data);
      });
    } catch (e) {
      console.error(e, 'onReceiver');
    }
  }

  on(name: string, handler: (data?: any) => void): void {
    try {
      if (this.messageMap[name]) {
        this.messageMap[name].push(handler);
      } else {
        this.messageMap[name] = [handler];
      }
    } catch (error) {
      console.error(error, 'on');
    }
  }

  off(name: string, handler: (data?: any) => void) {
    try {
      let fns = this.messageMap[name];
      if (!fns?.length) {
        return;
      }

      fns = fns.filter((fn) => fn !== handler);

      this.messageMap[name] = fns;
    } catch (error) {
      console.error(error, 'off');
    }
  }

  destroy(): void {
    this.messageMap = {};
  }

  async getKline(data: KLineParam) {
    try {
      const { chainId, tradePairId, from, to, type } = data;
      if (!(chainId && tradePairId && from && to && type) || !this.signalr) {
        return;
      }

      await this.signalr.invoke('RequestKline', chainId, tradePairId, type, from, to);
    } catch (error) {
      console.error(error, 'getKline error');
    }
  }

  async UnsubscribeKline(chainId: string, tradePairId: string, type: string) {
    if (!chainId || !tradePairId || !type) return;
    try {
      await this.signalr?.invoke('UnsubscribeKline', chainId, tradePairId, type);
    } catch (e) {
      console.error(e, 'UnsubscribeKline');
    }
  }

  async RequestTradePair(chainId: string) {
    if (!chainId || !this.signalr) {
      return;
    }
    try {
      await this.signalr.invoke('RequestTradePair', chainId);
    } catch (error) {
      console.error(error, 'RequestTradePair');
    }
  }

  async UnsubscribeTradePair(chainId: string) {
    if (!chainId || !this.signalr) {
      return;
    }
    try {
      await this.signalr.invoke('UnsubscribeTradePair', chainId);
    } catch (error) {
      console.error(error, 'UnsubscribeTradePair');
    }
  }

  async RequestTradeRecord(chainId?: string, tradePairId?: string, maxResultCount?: number) {
    if (!this.signalr || !chainId || !tradePairId) {
      return;
    }
    try {
      await this.signalr.invoke('RequestTradeRecord', chainId, tradePairId, 0, maxResultCount ?? 20);
    } catch (error) {
      console.error(error, 'RequestTradeRecord');
    }
  }

  async UnsubscribeTradeRecord(chainId?: string, tradePairId?: string) {
    if (!tradePairId || !chainId || !this.signalr || !tradePairId) return;
    try {
      await this.signalr.invoke('UnsubscribeTradeRecord', chainId, tradePairId, 0);
    } catch (error) {
      console.error(error, 'UnsubscribeTradeRecord');
    }
  }

  async RequestRemovedTradeRecord(chainId?: string, tradePairId?: string) {
    if (!this.signalr || !chainId || !tradePairId) {
      return;
    }

    try {
      await this.signalr?.invoke('RequestRemovedTradeRecord', chainId, tradePairId);
    } catch (error) {
      console.log(error, 'RequestRemovedTradeRecord');
    }
  }

  async UnsubscribeRemovedTradeRecord(chainId?: string, tradePairId?: string) {
    if (!this.signalr || !chainId || !tradePairId) {
      return;
    }

    try {
      await this.signalr?.invoke('UnsubscribeRemovedTradeRecord', chainId, tradePairId);
    } catch (error) {
      console.log(error, 'UnsubscribeRemovedTradeRecord');
    }
  }

  async RequestUserTradeRecord(chainId?: string, tradePairId?: string, address?: string, maxResultCount?: number) {
    if (!(chainId && tradePairId && address)) return;
    await this.signalr?.invoke('RequestUserTradeRecord', chainId, tradePairId, address, 0, maxResultCount ?? 20);
  }

  async UnsubscribeUserTradeRecord(chainId?: string, tradePairId?: string, address?: string) {
    if (!this.signalr || !chainId || !tradePairId || !address) {
      return;
    }
    try {
      await this.signalr.invoke('UnsubscribeUserTradeRecord', chainId, tradePairId, address, 0);
    } catch (error) {
      console.log(error, 'UnsubscribeUserTradeRecord');
    }
  }

  async RequestRemovedUserTradeRecord(chainId?: string, tradePairId?: string, address?: string) {
    if (!this.signalr || !chainId || !tradePairId || !address) {
      return;
    }

    try {
      await this.signalr?.invoke('RequestRemovedUserTradeRecord', chainId, tradePairId, address);
    } catch (error) {
      console.log(error, 'RequestRemovedUserTradeRecord');
    }
  }

  async UnsubscribeRemovedUserTradeRecord(chainId?: string, tradePairId?: string, address?: string) {
    if (!this.signalr || !chainId || !tradePairId || !address) {
      return;
    }

    try {
      await this.signalr?.invoke('UnsubscribeRemovedUserTradeRecord', chainId, tradePairId, address);
    } catch (error) {
      console.log(error, 'UnsubscribeRemovedUserTradeRecord');
    }
  }

  async RequestTradePairDetail(tradePairId?: string) {
    if (!this.signalr || !tradePairId) {
      return;
    }

    try {
      await this.signalr?.invoke('RequestTradePairDetail', tradePairId);
    } catch (error) {
      console.log(error, 'RequestTradePairDetail');
    }
  }

  async UnsubscribeTradePairDetail(tradePairId?: string) {
    if (!this.signalr || !tradePairId) {
      return;
    }

    try {
      await this.signalr?.invoke('UnsubscribeTradePairDetail', tradePairId);
    } catch (error) {
      console.log(error, 'UnsubscribeTradePairDetail');
    }
  }
}
