import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useLocalStorage } from 'react-use';
import storages from 'storages';
import { Token } from 'types';

const INITIAL_STATE = {};
const UserContext = createContext<any>(INITIAL_STATE);

type State = {
  tokens: {
    [chainId: number]: {
      [address: string]: Token;
    };
    [chainId: string]: {
      [address: string]: Token;
    };
  };
  favListMap: {
    [address: string]: {
      value: string[];
      index: number;
    };
  };
  favChangeItem: {
    id?: string;
    address?: string;
    isFav?: boolean;
    favId?: string | null;
  };
  assetTotalSymbol: {
    [address: string]: string;
  };
};
type Actions = {
  addToken: (token: Token) => void;
  removeToken: (address: string, chainId: number) => void;
  clearChainIdTokens: (chainId: number) => void;
  favListChange: ({ address, id }: { address?: string; id: string }) => void;
  getFavList: (address: string) => string[];
  isFavById: (address?: string, id?: string) => boolean;
  setFavChangeItem: (params: { favId?: string | null; isFav?: boolean; id?: string; address?: string }) => void;
  setAssetTotalSymbol: (address: string, symbol: string) => void;
  getAssetTotalSymbol: (address: string) => string;
};

export function useUser(): [State, Actions] {
  return useContext(UserContext);
}

export default function Provider({ children }: { children: React.ReactNode }) {
  const [tokens, setTokens] = useLocalStorage<State['tokens']>(storages.userTokens);

  const [favListMap, setFavListMap] = useLocalStorage<State['favListMap']>(storages.awakenFavList, {});

  const [favChangeItem, setFavListItem] = useState<State['favChangeItem']>({});

  const [assetSymbol, setTotalSymbol] = useLocalStorage<State['assetTotalSymbol']>(storages.awakenAssetSymbol, {});

  const addToken: Actions['addToken'] = useCallback(
    (token) => {
      let ts = tokens;
      if (!ts) ts = {};
      ts[token.chainId] = tokens?.[token.chainId] || {};
      ts[token.chainId][token.address] = token;
      setTokens(ts);
    },
    [setTokens, tokens],
  );
  const removeToken: Actions['removeToken'] = useCallback(
    (address, chainId) => {
      let ts = tokens;
      if (!ts) ts = {};
      ts[chainId] = tokens?.[chainId] || {};
      delete ts[chainId][address];
      setTokens(ts);
    },
    [setTokens, tokens],
  );
  const clearChainIdTokens: Actions['clearChainIdTokens'] = useCallback(
    (chainId) => {
      let ts = tokens;
      if (!ts) ts = {};
      ts[chainId] = {};
      setTokens(ts);
    },
    [setTokens, tokens],
  );

  const setFavList = useCallback(
    (address: string, list: string[]) => {
      const listMap = favListMap ?? {};

      if (listMap[address]) {
        listMap[address].value = list;
        setFavListMap(listMap);
        return;
      }

      const len = Object.keys(listMap).length;

      if (len < 3) {
        listMap[address] = {
          index: len,
          value: list,
        };

        setFavListMap(listMap);
        return;
      }

      const newListMap: State['favListMap'] = {};

      Object.entries(listMap).map((item: [string, { value: string[]; index: number }]) => {
        if (item[1].index !== 0) {
          newListMap[item[0]] = {
            index: item[1].index - 1,
            value: item[1].value,
          };
        }
      });

      newListMap[address] = {
        index: 2,
        value: list,
      };

      setFavListMap(newListMap);
    },
    [favListMap, setFavListMap],
  );

  const getFavList = useCallback(
    (address: string) => {
      if (!address) {
        return [];
      }

      const fav = favListMap || {};

      return fav[address]?.value ?? [];
    },
    [favListMap],
  );

  const favListChange = useCallback(
    ({ address, id }: { address: string; id: string }) => {
      const favList = getFavList(address);

      const index = favList.indexOf(id);

      if (index > -1) {
        favList.splice(index, 1);
      } else {
        favList.push(id);
      }

      setFavList(address, favList);
    },
    [setFavList, getFavList],
  );

  const setFavChangeItem = useCallback(
    (params: { favId?: string | null; isFav?: boolean; id?: string; address?: string }) => {
      if (!params?.address) {
        return;
      }

      setFavListItem(params);
    },
    [],
  );

  const isFavById = useCallback(
    (address?: string, id?: string): boolean => {
      if (!address || !id) {
        return false;
      }

      const favList = getFavList(address);

      return favList.includes(id);
    },
    [getFavList],
  );

  const getAssetTotalSymbol = useCallback(
    (address?: string) => {
      if (!address || !assetSymbol) {
        return;
      }
      return assetSymbol[address];
    },
    [assetSymbol],
  );

  const setAssetTotalSymbol = useCallback(
    (address: string, symbol: string) => {
      setTotalSymbol({
        [address]: symbol,
      });
    },
    [setTotalSymbol],
  );

  return (
    <UserContext.Provider
      value={useMemo(
        () => [
          { tokens, favListMap, favChangeItem },
          {
            addToken,
            removeToken,
            clearChainIdTokens,
            favListChange,
            getFavList,
            isFavById,
            setFavChangeItem,
            getAssetTotalSymbol,
            setAssetTotalSymbol,
          },
        ],
        [
          tokens,
          favListMap,
          favChangeItem,
          addToken,
          removeToken,
          clearChainIdTokens,
          favListChange,
          getFavList,
          isFavById,
          setFavChangeItem,
          getAssetTotalSymbol,
          setAssetTotalSymbol,
        ],
      )}>
      {children}
    </UserContext.Provider>
  );
}
