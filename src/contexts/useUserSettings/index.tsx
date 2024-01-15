import { DEFAULT_EXPIRATION, DEFAULT_SLIPPAGE_TOLERANCE } from 'constants/swap';
import React, { createContext, useContext, useMemo } from 'react';
import { useLocalStorage } from 'react-use';
import storages from 'storages';

const INITIAL_STATE = {};
const UserSettingsContext = createContext<any>(INITIAL_STATE);

type State = {
  userSlippageTolerance?: string;
  userExpiration?: string;
  isExpert?: boolean;
};
type Actions = {
  setUserSlippageTolerance: (userSlippageTolerance?: string) => void;
  setUserExpiration: (userExpiration?: string) => void;
  setIsExpert: (isExpert?: boolean) => void;
};

export function useUserSettings(): [State, Actions] {
  return useContext(UserSettingsContext);
}

export default function Provider({ children }: { children: React.ReactNode }) {
  const [userSlippageTolerance, setUserSlippageTolerance] = useLocalStorage<State['userSlippageTolerance']>(
    storages.userSlippageTolerance,
    DEFAULT_SLIPPAGE_TOLERANCE,
  );
  const [userExpiration, setUserExpiration] = useLocalStorage<State['userExpiration']>(
    storages.userExpiration,
    DEFAULT_EXPIRATION,
  );
  const [isExpert, setIsExpert] = useLocalStorage<State['isExpert']>(storages.userIsExpert, false);
  return (
    <UserSettingsContext.Provider
      value={useMemo(
        () => [
          {
            userSlippageTolerance,
            userExpiration,
            isExpert,
          },
          {
            setIsExpert,
            setUserSlippageTolerance,
            setUserExpiration,
          },
        ],
        [userSlippageTolerance, userExpiration, isExpert, setIsExpert, setUserSlippageTolerance, setUserExpiration],
      )}>
      {children}
    </UserSettingsContext.Provider>
  );
}
