const API_ENV = process.env.REACT_APP_API_ENV || 'mainnet';

export type ApiConfig = {
  socket: string;
  explorer: string;
};

const apiConfig: { [key: string]: ApiConfig } = {
  local: {
    socket: 'https://test-app.awaken.finance',
    explorer: 'https://testnet.aelfscan.io/tDVW',
  },
  test: {
    socket: 'https://test-app.awaken.finance',
    explorer: 'https://testnet.aelfscan.io/tDVW',
  },
  preview: {
    socket: 'https://test-app.awaken.finance',
    explorer: 'https://testnet.aelfscan.io/tDVW',
  },
  mainnet: {
    socket: 'https://app-k8s.awaken.finance',
    explorer: 'https://aelfscan.io/tDVV',
  },
};

export default apiConfig[API_ENV as string];
