import { useCallback, useMemo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

export const useGoBack = () => {
  const history = useHistory();

  return useCallback(() => {
    if (window.history.length === 1) {
      history.replace('/');
    } else {
      history.goBack();
    }
  }, [history]);
};

export const useIsDepositPath = () => {
  const { pathname } = useLocation();
  return useMemo(() => pathname === '/deposit' || pathname === '/withdraw', [pathname]);
};
