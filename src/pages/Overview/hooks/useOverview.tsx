import { createContext, useCallback, useContext, useMemo, useReducer } from 'react';
import Signalr from 'socket/signalr';

const SOCKET_CHANGE = 'SOCKET_CHANGE';
export interface SymbolItem {
  id: string;
  symbol?: string;
}

interface INITIAL_STATE_CON {
  socket: Signalr | null;
}
interface Actions {
  setSocket: (v: Signalr) => void;
}

const INITIAL_STATE = {
  socket: null,
};

const OVContext = createContext<any>(INITIAL_STATE);

function reducer(state: any, { type, payload }: any) {
  switch (type) {
    case SOCKET_CHANGE: {
      return Object.assign({}, state, payload);
    }
  }
}

export function useOVContext(): [INITIAL_STATE_CON, Actions] {
  return useContext(OVContext);
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

  return (
    <OVContext.Provider
      value={useMemo(
        () => [
          { ...state },
          {
            setSocket,
          },
        ],
        [state, setSocket],
      )}>
      {children}
    </OVContext.Provider>
  );
}
