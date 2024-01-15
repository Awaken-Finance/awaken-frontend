import { PoolItem, PairItem } from 'types';
import { useActiveWeb3React } from 'hooks/web3';
import { createContext, useCallback, useContext, useMemo, useReducer } from 'react';
import Signalr from 'socket/signalr';
import { getCurrency } from 'utils/swap';
const PAIR_CHANGE = 'PAIR_CHANGE';
const SOCKET_CHANGE = 'SOCKET_CHANGE';
const PAIR_INFO_UPDATER = 'PAIR_INFO_UPDATER';
const CHART_IS_READY = 'CHART_IS_READY';
export interface SymbolItem {
  id: string;
  symbol?: string;
}

interface INITIAL_STATE_CON {
  symbolItem: SymbolItem;
  isShowLoading: boolean;
  socket: Signalr | null;
  poolItemMap: { [x: string]: PairItem };

  pairInfo: PoolItem | null;
}
interface Actions {
  setSocket: (v: Signalr) => void;
  tradePairsUpdater: (v: { [x: string]: PairItem }) => void;
  pairInfoUpdater: (v?: PairItem) => void;
}

const INITIAL_STATE = {
  symbolItem: {},
  isShowLoading: true,
  socket: null,
  pairInfo: null,
};

const SwapContext = createContext<any>(INITIAL_STATE);

function reducer(state: any, { type, payload }: any) {
  switch (type) {
    case PAIR_CHANGE: {
      return Object.assign({}, state, payload);
    }
    case SOCKET_CHANGE: {
      return Object.assign({}, state, payload);
    }
    case PAIR_INFO_UPDATER:
      return Object.assign({}, state, payload);
    case CHART_IS_READY:
      return Object.assign({}, state, payload);
    default: {
      return Object.assign({}, state, payload);
    }
  }
}

export function useSwapContext(): [INITIAL_STATE_CON, Actions] {
  return useContext(SwapContext);
}
export default function Provider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const setSocket = useCallback(
    (v: Signalr) => {
      dispatch({
        type: SOCKET_CHANGE,
        payload: { socket: v },
      });
    },
    [dispatch],
  );
  const pairInfoUpdater = useCallback(
    (v?: PairItem) => {
      dispatch({
        type: PAIR_INFO_UPDATER,
        payload: { pairInfo: v },
      });
    },
    [dispatch],
  );

  return (
    <SwapContext.Provider
      value={useMemo(
        () => [
          { ...state },
          {
            setSocket,
            pairInfoUpdater,
          },
        ],
        [state, setSocket, pairInfoUpdater],
      )}>
      {children}
    </SwapContext.Provider>
  );
}

export function usePairInfo() {
  const [{ pairInfo }] = useSwapContext();
  return useMemo(() => pairInfo, [pairInfo]);
}

export function usePairTokens() {
  const { chainId } = useActiveWeb3React();
  const pairInfo = usePairInfo();
  const { token0, token1, feeRate } = pairInfo || {};
  const tokenA = useMemo(() => {
    if (!token0) return;
    return getCurrency(token0, chainId);
  }, [chainId, token0]);

  const tokenB = useMemo(() => {
    if (!token1) return;
    return getCurrency(token1, chainId);
  }, [chainId, token1]);
  return {
    tokenA,
    tokenB,
    feeRate: feeRate?.toString(),
  };
}
