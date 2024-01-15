export interface Options {
  [x: string]: any;
}

export interface Receive {
  Event: string;
  Data?: any;
}

export interface KLineParam {
  from: number;
  chainId: string;
  tradePairId: string;
  type: string;
  to: number;
}
export interface UpdateKlineType {
  chainId: string;
  tradePairId: string;
  period: number;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}
export interface subParam {
  sub?: string;
  id: string;
  unSub?: string;
}

export interface TradeItem {
  id: string;
  chainId: string;
  address: string;
  side: number;
  price: number;
  token0Amount: string;
  token1Amount: string;
  timestamp: number;
  transactionHash: string;
  tradePair: {
    token0: {
      address: string;
      symbol: string;
      decimals: number;
      id: string;
    };
    token1: {
      address: string;
      symbol: string;
      decimals: number;
      id: string;
    };
    address: string;
    feeRate: number;
    id: string;
  };
}

export interface ReceiveUserTradeRecordsInterface {
  chainId: string;
  tradePairId: string;
  address: string;
  data: TradeItem[];
}
