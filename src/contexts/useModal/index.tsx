import { BasicActions } from 'contexts/utils';
import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { basicModalView, modalState } from './actions';

const INITIAL_STATE = {};
const ModalContext = createContext<any>(INITIAL_STATE);

export function useModal(): [modalState, BasicActions] {
  return useContext(ModalContext);
}

//reducer
function reducer(state: any, { type, payload }: any) {
  switch (type) {
    case basicModalView.destroy.type: {
      return {};
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
  useEffect(() => {
    const destroy = () => {
      dispatch(basicModalView.destroy.actions());
    };
    window.addEventListener('popstate', destroy);
    return () => window.removeEventListener('popstate', destroy);
  }, []);
  return (
    <ModalContext.Provider value={useMemo(() => [{ ...state }, { dispatch }], [state, dispatch])}>
      {children}
    </ModalContext.Provider>
  );
}
