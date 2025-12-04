import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import { useAElf } from 'contexts/useAElf';
import { sleep } from 'utils';
import { initContracts } from 'utils/aelfUtils';
import { ChainConstants } from 'constants/ChainConstants';
import { aelfContractActions, setContract } from './actions';
import { BasicActions } from 'contexts/utils';
import { ContractContextState } from './types';

const INITIAL_STATE = {};
const ContractContext = createContext<any>(INITIAL_STATE);

export function useAElfContractContext(): [ContractContextState, BasicActions<aelfContractActions>] {
  return useContext(ContractContext);
}

//reducer
function reducer(state: any, { type, payload }: any) {
  switch (type) {
    case aelfContractActions.destroy: {
      return {};
    }
    default: {
      return Object.assign({}, state, payload);
    }
  }
}

export default function Provider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  console.log(state, '=====state');

  const [{ aelfInstance, address }] = useAElf();
  const initNumber = useRef<number>(0);
  const init = useCallback(
    async (num: number) => {
      if (aelfInstance?.chain && ChainConstants.constants.CONTRACTS) {
        try {
          // Need to initialize the contract at the same time
          // getChainStatus will clear the contracts of NightElf
          dispatch({ type: aelfContractActions.destroy });
          const contracts = await initContracts(ChainConstants.constants.CONTRACTS, aelfInstance, address);
          // last initialized contracts
          if (num === initNumber.current) {
            dispatch(setContract(contracts));
          }
        } catch (error) {
          console.log(error, 'init Contract');
          // Initialize again at one second interval after initialization failure
          await sleep(1000);
          init(++initNumber.current);
        }
      }
    },
    [address, aelfInstance],
  );

  const actions = useMemo(() => ({ dispatch }), [dispatch]);

  useEffect(() => {
    init(++initNumber.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, aelfInstance]);
  return (
    <ContractContext.Provider value={useMemo(() => [state, actions], [actions, state])}>
      {children}
    </ContractContext.Provider>
  );
}
