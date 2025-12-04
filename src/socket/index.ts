import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import SignalR from './signalr';
export default function Socket() {
  const [error, setError] = useState<any>(null);
  const [socket, setSocket] = useState<SignalR | null>(null);
  const { pathname } = useLocation();
  useEffect(() => {
    const signalR = new SignalR();
    if (error !== false) {
      signalR
        .doOpen()
        .then(() => {
          setSocket(signalR);
          setError(false);
        })
        .catch((e) => {
          setSocket(signalR);
          setError(e);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return socket;
}
