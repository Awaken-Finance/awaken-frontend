import { useBTCPrice, useTokenUSDPrice } from 'contexts/useTokenPrice/hooks';
import React, { createContext, useReducer, useMemo } from 'react';
import storages from 'storages';
import { UserCenterState, ReducerAction } from '../type';

function reducer(state: UserCenterState, action: ReducerAction): UserCenterState {
  switch (action.type) {
    case 'UPDATE_ASSET_HIDDEN':
      localStorage.setItem(storages.userAssetHidden, JSON.stringify(!state.userAssetHidden));
      return Object.assign({}, state, {
        userAssetHidden: !state.userAssetHidden,
      });
    case 'UPDATE_ASSET_ITEM':
      return Object.assign({}, state, {
        [action.value]: Date.now(),
      });
    case 'UPDATE':
      return Object.assign({}, state, { ...action.value });
    default:
      return state;
  }
}

const initialState: UserCenterState = {
  userAssetHidden: JSON.parse(localStorage.getItem(storages.userAssetHidden) || 'false'),
};

const UserCenterContext = createContext<{
  state: UserCenterState;
  dispatch: React.Dispatch<ReducerAction>;
  BTCPrice: string;
  ELFPrice: string;
  ETHPrice: string;
}>({
  state: initialState,
  dispatch: () => null,
  BTCPrice: '0',
  ELFPrice: '0',
  ETHPrice: '0',
});

function UserCenterProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const BTCPrice = useBTCPrice();
  const ETHPrice = useTokenUSDPrice('ETH');
  const ELFPrice = useTokenUSDPrice('ELF');

  return (
    <UserCenterContext.Provider
      value={useMemo(
        () => ({
          state,
          dispatch,
          BTCPrice,
          ELFPrice,
          ETHPrice,
        }),
        [state, BTCPrice, ELFPrice, ETHPrice],
      )}>
      {children}
    </UserCenterContext.Provider>
  );
}

export { UserCenterProvider, UserCenterContext };
