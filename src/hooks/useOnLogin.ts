import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function useOnLogin(callback: () => void) {
  const location = useLocation();
  useEffect(() => {
    if (location.pathname === '/login' || location.pathname === '/signup') {
      callback();
    }
  }, [callback, location.pathname]);
}
