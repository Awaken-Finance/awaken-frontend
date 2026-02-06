import { useCallback } from 'react';
import { useHistory } from 'react-router-dom';

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
