import { PinnedToken, PoolItem } from 'types';
import { PairItem } from 'types';

export interface SymbolItem {
  id: string;
  symbol?: string;
}
export interface TradingState {
  poolItemMap: { [x: string]: PairItem } | null;
  pinned_tokens: PinnedToken[] | undefined;
  tradePairMap: {
    [x: string]: PairItem;
  };
  pairInfo: PoolItem | null;
}

export enum TradingActionType {
  PAIR_CHANGE = 'PAIR_CHANGE',
  SOCKET_CHANGE = 'SOCKET_CHANGE',
  PAIR_ITEM_UPDATER = 'PAIR_ITEM_UPDATER',
  PINNED_TOKENS = 'PINNED_TOKENS',
  TRADE_PAIRS_LIST = 'TRADE_PAIRS_LIST',
  PAIR_INFO_UPDATER = 'PAIR_INFO_UPDATER',
  CHART_IS_READY = 'CHART_IS_READY',
}

export interface TradingAction {
  type: TradingActionType;
  value?: any;
}
