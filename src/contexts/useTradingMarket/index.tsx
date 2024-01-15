import { createContext, useCallback, useMemo, useReducer } from 'react';
import { TradingState, TradingAction, TradingActionType } from './hooks';

const defaultState: TradingState = {
  poolItemMap: null,
  pinned_tokens: [],
  tradePairMap: {},
  pairInfo: null,
};
const reducer = (state: TradingState, action: TradingAction): TradingState => {
  const payload = action.value;
  switch (action.type) {
    case TradingActionType.PAIR_CHANGE: {
      return Object.assign({}, state, payload);
    }
    case TradingActionType.PAIR_ITEM_UPDATER: {
      let mayPairInfo = {};
      if (Object.keys(payload)[0] === state.pairInfo?.id) {
        mayPairInfo = { pairInfo: Object.values(payload)[0] };
      }
      return Object.assign(
        {},
        state,
        {
          tradePairMap: { ...state.tradePairMap, ...payload },
        },
        mayPairInfo,
      );
    }

    case TradingActionType.PINNED_TOKENS:
      return Object.assign({}, state, {
        pinned_tokens: payload,
      });

    case TradingActionType.TRADE_PAIRS_LIST:
      return Object.assign({}, state, { tradePairMap: payload });
    case TradingActionType.PAIR_INFO_UPDATER:
      return Object.assign({}, state, payload);
    default: {
      return Object.assign({}, state, payload);
    }
  }
};
const TradingMarket = createContext<any>(defaultState);
const Provider: React.FC = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, defaultState);

  const pairInfoUpdater = useCallback(
    (v: any) => {
      dispatch({
        type: TradingActionType.PAIR_INFO_UPDATER,
        value: { pairInfo: v },
      });
    },
    [dispatch],
  );

  return (
    <TradingMarket.Provider value={useMemo(() => [{ ...state }, pairInfoUpdater], [state, pairInfoUpdater])}>
      {children}
    </TradingMarket.Provider>
  );
};

export default Provider;
