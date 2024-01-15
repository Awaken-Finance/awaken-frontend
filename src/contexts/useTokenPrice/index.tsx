import { ChainConstants } from 'constants/ChainConstants';
import { BasicActions } from 'contexts/utils';
import React, { createContext, useContext, useMemo, useReducer } from 'react';
import { basicTokenPricesView, State } from './actions';

const INITIAL_STATE = {};
const TokenPricesContext = createContext<any>(INITIAL_STATE);

export function useTokenPrices(): [State, BasicActions] {
  return useContext(TokenPricesContext);
}

//reducer
function reducer(state: State, { type, payload }: any) {
  switch (type) {
    case basicTokenPricesView.setTokenPrice.type: {
      const { tokenPrices } = state || {};
      const chainTokenPrices = Object.assign({}, tokenPrices?.[ChainConstants.chainId] || {}, payload);
      const tmpTokenPrices = Object.assign({}, tokenPrices || {}, {
        [ChainConstants.chainId]: chainTokenPrices,
      });
      return Object.assign({}, state, { tokenPrices: tmpTokenPrices });
    }
    default: {
      const { destroy } = payload;
      if (destroy) return Object.assign({}, payload);
      return Object.assign({}, state, payload);
    }
  }
}

export default function Provider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  return (
    <TokenPricesContext.Provider value={useMemo(() => [state, { dispatch }], [state, dispatch])}>
      {children}
    </TokenPricesContext.Provider>
  );
}
